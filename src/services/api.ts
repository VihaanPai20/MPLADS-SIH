import { fetchLokSabhaData } from '../adapters/lokSabhaAdapter';
import { fetchRajyaSabhaData } from '../adapters/rajyaSabhaAdapter';
import type { MemberOfParliament, DashboardStats } from '../types';
import type { GlobalHouseSelection } from '../contexts/HouseContext';

// Cache for the normalized datasets so we only fetch/parse once per session
let cachedLokSabha: MemberOfParliament[] | null = null;
let cachedRajyaSabha: MemberOfParliament[] | null = null;

const API_BASE_URL = 'http://localhost:8000';

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
  let complianceCount = 0; // Keeping 0 for now since compliance is separate from ML

  for (const risk of mlRisks) {
    if (risk.risk_level === 'HIGH' || risk.risk_level === 'CRITICAL' || risk.is_anomaly) highRiskCount++;
    if (risk.is_duplicate) duplicateCount++;
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
  let duplicates = 0;
  const names = new Set();

  for (const mp of members) {
    if (!mp.name || !mp.state) missingFields++;
    if (names.has(mp.name.toLowerCase())) duplicates++;
    names.add(mp.name.toLowerCase());
  }

  const qualityScore = 100 - ((missingFields / total) * 100) - ((duplicates / total) * 100);

  return {
    records: total,
    missingFields: (missingFields / total) * 100,
    potentialDuplicates: (duplicates / total) * 100,
    qualityScore: Math.max(0, qualityScore)
  };
}

// --------------------------------------------------------
// ML API ENDPOINTS
// --------------------------------------------------------

export async function getMLStatus(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/ml/status`);
    if (!res.ok) throw new Error('ML Status fetch failed');
    return res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function trainMLModels(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/ml/train`, { method: 'POST' });
    if (!res.ok) throw new Error('ML Train failed');
    return res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getMLRiskAnalysis(house: string = 'ALL'): Promise<any[]> {
  try {
    const url = new URL(`${API_BASE_URL}/api/ml/risk`);
    if (house && house !== 'ALL') url.searchParams.append('house', house);
    
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('ML Risk fetch failed');
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}
