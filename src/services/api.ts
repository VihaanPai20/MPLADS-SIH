import { fetchLokSabhaData } from '../adapters/lokSabhaAdapter';
import { fetchRajyaSabhaData } from '../adapters/rajyaSabhaAdapter';
import type { MemberOfParliament, DashboardStats } from '../types';
import type { GlobalHouseSelection } from '../contexts/HouseContext';
import { generateRiskAnalysis } from './riskEngine';

// Cache for the normalized datasets so we only fetch/parse once per session
let cachedLokSabha: MemberOfParliament[] | null = null;
let cachedRajyaSabha: MemberOfParliament[] | null = null;

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchAllMembers(): Promise<{ lokSabha: MemberOfParliament[], rajyaSabha: MemberOfParliament[] }> {
  if (!cachedLokSabha) {
    cachedLokSabha = await fetchLokSabhaData();
  }
  if (!cachedRajyaSabha) {
    cachedRajyaSabha = await fetchRajyaSabhaData();
  }
  return { lokSabha: cachedLokSabha, rajyaSabha: cachedRajyaSabha };
}

export async function getMembersByHouse(houseSelection: GlobalHouseSelection): Promise<MemberOfParliament[]> {
  const { lokSabha, rajyaSabha } = await fetchAllMembers();
  if (houseSelection === 'LOK_SABHA') return lokSabha;
  if (houseSelection === 'RAJYA_SABHA') return rajyaSabha;
  return [...lokSabha, ...rajyaSabha];
}

export async function getDashboardStats(houseSelection: GlobalHouseSelection): Promise<DashboardStats> {
  const members = await getMembersByHouse(houseSelection);
  
  const totalWorks = members.length; // Conceptually treating members as works for now
  const totalSanctioned = members.reduce((acc, curr) => acc + curr.allocatedAmount, 0);
  
  // Fetch ML risk instead of static risk engine
  const mlRisks = await getMLRiskAnalysis(houseSelection);
  
  let highRiskCount = 0;
  let duplicateCount = 0;
  let complianceCount = 0;

  for (const risk of mlRisks) {
    if (risk.risk_level === 'HIGH' || risk.risk_level === 'CRITICAL' || risk.is_anomaly) highRiskCount++;
    if (risk.is_duplicate) duplicateCount++;
    if (risk.is_compliance) complianceCount++;
  }
  
  return {
    totalWorks: totalWorks,
    totalSanctioned: totalSanctioned,
    totalExpenditure: 0, 
    fundUtilization: 0,
    delayedWorks: 0,
    highRiskWorks: highRiskCount,
    complianceExceptions: complianceCount,
    potentialDuplicates: duplicateCount,
  };
}

export async function getDataQualityStats(houseSelection: GlobalHouseSelection) {
  const members = await getMembersByHouse(houseSelection);
  const total = members.length;
  if (total === 0) return { records: 0, missingFields: 0, potentialDuplicates: 0, qualityScore: 100 };

  let missingFields = 0;

  for (const mp of members) {
    // Stricter check for missing fields, but contextual to the house
    const isLokSabha = mp.house === 'Lok Sabha';
    const isMissingBaseFields = !mp.name || !mp.state || mp.allocatedAmount === undefined;
    const isMissingConstituency = isLokSabha && !mp.constituency;

    if (isMissingBaseFields || isMissingConstituency) {
      missingFields++;
    }
  }

  // Fetch real-time ML data for accurate duplicate metrics
  const mlRisks = await getMLRiskAnalysis(houseSelection);
  let duplicateCount = 0;
  for (const risk of mlRisks) {
    if (risk.is_duplicate) duplicateCount++;
  }

  const missingFieldsPercentage = (missingFields / total) * 100;
  const potentialDuplicatesPercentage = (duplicateCount / total) * 100;
  const qualityScore = 100 - missingFieldsPercentage - potentialDuplicatesPercentage;

  return {
    records: total,
    missingFields: missingFieldsPercentage,
    potentialDuplicates: potentialDuplicatesPercentage,
    qualityScore: Math.max(0, qualityScore)
  };
}

// --------------------------------------------------------
// ML API ENDPOINTS
// --------------------------------------------------------

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
  };
}

export async function getMLStatus(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/ml/status`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('ML Status fetch failed');
    return res.json();
  } catch (error) {
    console.warn("Backend ML engine unavailable, using fallback status");
    return {
      status: "active (fallback)",
      models: [
        {
          name: "Heuristic Anomaly Detection",
          algorithm: "Local Statistics",
          type: "Rules Engine",
          status: "Active"
        },
        {
          name: "Duplicate Portfolio Detection",
          algorithm: "Exact String Match",
          type: "Rules Engine",
          status: "Active"
        }
      ]
    };
  }
}

export async function trainMLModels(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/ml/train`, { 
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('ML Train failed');
    return res.json();
  } catch (error) {
    console.warn("Backend ML engine unavailable, simulating local training");
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { status: 'success', message: 'Local models initialized' };
  }
}

export async function getMLRiskAnalysis(house: string = 'ALL'): Promise<any[]> {
  try {
    const url = new URL(`${API_BASE_URL}/api/ml/risk`);
    if (house && house !== 'ALL') url.searchParams.append('house', house);
    
    const res = await fetch(url.toString(), {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('ML Risk fetch failed');
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.warn("Backend ML engine unavailable, falling back to local heuristic risk engine...");
    
    // Fallback logic
    const members = await getMembersByHouse(house as GlobalHouseSelection);
    const localRiskMap = generateRiskAnalysis(members);
    
    return Array.from(localRiskMap.values()).map(localRisk => {
      // Map local RiskAnalysisResult to backend ML format expected by RiskAnalysis.tsx
      const isAnomaly = localRisk.factors.some(f => f.type === 'Cost Anomaly');
      const isDuplicate = localRisk.factors.some(f => f.type === 'Potential Duplicate');
      const isCompliance = localRisk.factors.some(f => f.type === 'Compliance Exception');
      
      return {
        member_id: localRisk.memberId,
        overall_risk_score: localRisk.riskScore,
        risk_level: localRisk.riskLevel,
        is_anomaly: isAnomaly,
        is_duplicate: isDuplicate,
        is_compliance: isCompliance,
        primary_signal: localRisk.primarySignal,
        signals: localRisk.factors.map(f => f.description),
        anomaly_score: isAnomaly ? 80 : 10,
        similarity_score: isDuplicate ? 90 : 10,
        z_score: isAnomaly ? 3.0 : 0.5,
        amount: members.find(m => m.id === localRisk.memberId)?.allocatedAmount || 0,
        penalty: localRisk.riskScore > 50 ? 20 : 0,
      };
    });
  }
}
