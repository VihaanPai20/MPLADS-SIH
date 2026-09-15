import type { MemberOfParliament } from '../types';

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface RiskFactor {
  type: string;
  description: string;
  evidence: string;
  scoreImpact: number;
}

export interface RiskAnalysisResult {
  memberId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  factors: RiskFactor[];
  recommendedAction: string;
  primarySignal: string | null;
}

export function generateRiskAnalysis(members: MemberOfParliament[]): Map<string, RiskAnalysisResult> {
  const stateAllocations = new Map<string, number[]>();
  
  // Calculate allocations per state to find anomalies
  for (const m of members) {
    if (!m.state) continue;
    const arr = stateAllocations.get(m.state) || [];
    arr.push(m.allocatedAmount);
    stateAllocations.set(m.state, arr);
  }

  const stateStats = new Map<string, { mean: number; stdDev: number }>();
  for (const [state, amounts] of stateAllocations.entries()) {
    if (amounts.length === 0) continue;
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    stateStats.set(state, { mean, stdDev });
  }

  const nameSet = new Map<string, string[]>(); // Normalized name -> Member IDs
  for (const m of members) {
    if (!m.name) continue;
    const norm = m.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const arr = nameSet.get(norm) || [];
    arr.push(m.id);
    nameSet.set(norm, arr);
  }

  const results = new Map<string, RiskAnalysisResult>();

  for (const m of members) {
    let score = 0;
    const factors: RiskFactor[] = [];

    // 1. Cost Anomaly
    if (m.state && stateStats.has(m.state)) {
      const stats = stateStats.get(m.state)!;
      if (stats.stdDev > 0 && m.allocatedAmount > stats.mean + (1.5 * stats.stdDev)) {
        const impact = 45;
        score += impact;
        factors.push({
          type: 'Cost Anomaly',
          description: 'Allocation significantly higher than state average.',
          evidence: `Allocated: ₹${m.allocatedAmount.toLocaleString()} vs State Mean: ₹${stats.mean.toLocaleString(undefined, {maximumFractionDigits: 0})}`,
          scoreImpact: impact
        });
      }
    }

    // 2. Potential Duplicate
    if (m.name) {
      const norm = m.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const ids = nameSet.get(norm);
      if (ids && ids.length > 1) {
        const impact = 60;
        score += impact;
        factors.push({
          type: 'Potential Duplicate',
          description: 'Similar or exact member name exists in the dataset.',
          evidence: `Found ${ids.length} identical/similar records. IDs: ${ids.join(', ')}`,
          scoreImpact: impact
        });
      }
    }

    // 3. Compliance Exception
    if (!m.state || (m.house === 'Lok Sabha' && !m.constituency)) {
      const impact = 30;
      score += impact;
      factors.push({
        type: 'Compliance Exception',
        description: 'Missing critical geographic fields.',
        evidence: !m.state ? 'Missing State' : 'Missing Constituency',
        scoreImpact: impact
      });
    }

    score = Math.min(100, score);
    let level: RiskLevel = 'LOW';
    if (score >= 75) level = 'CRITICAL';
    else if (score >= 50) level = 'HIGH';
    else if (score >= 25) level = 'MODERATE';

    let primarySignal = null;
    if (factors.length > 0) {
      primarySignal = factors.sort((a, b) => b.scoreImpact - a.scoreImpact)[0].type;
    }

    let recommendedAction = 'No immediate action required.';
    if (level === 'CRITICAL' || level === 'HIGH') {
      if (primarySignal === 'Potential Duplicate') {
        recommendedAction = 'Verify member identity to ensure allocations are not being double-counted.';
      } else if (primarySignal === 'Cost Anomaly') {
        recommendedAction = 'Audit allocation documentation and verify funding justifications against state guidelines.';
      } else {
        recommendedAction = 'Review member record for critical compliance issues.';
      }
    }

    results.set(m.id, {
      memberId: m.id,
      riskScore: score,
      riskLevel: level,
      factors,
      recommendedAction,
      primarySignal
    });
  }

  return results;
}
