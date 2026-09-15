import type { MemberOfParliament } from '../types';
import type { RiskAnalysisResult } from './riskEngine';

export interface AlertData {
  id: string;
  member: MemberOfParliament | undefined;
  risk: RiskAnalysisResult;
  severity: string;
  status: 'OPEN' | 'RESOLVED';
  type: string;
  detectedAt: string;
}

export function generateAlerts(
  members: MemberOfParliament[],
  riskResults: RiskAnalysisResult[],
  resolvedAlerts: Set<string>
): AlertData[] {
  return riskResults
    .filter(r => r.riskScore >= 25)
    .map(r => {
      const member = members.find(m => m.id === r.memberId);
      const alertId = `ALT-${r.memberId}`;
      return {
        id: alertId,
        member,
        risk: r,
        severity: r.riskLevel,
        status: (resolvedAlerts.has(alertId) ? 'RESOLVED' : 'OPEN') as 'OPEN' | 'RESOLVED',
        type: r.primarySignal || 'General Anomaly',
        detectedAt: '2023-11-20', // Static date as source has no dates
      };
    })
    .sort((a, b) => b.risk.riskScore - a.risk.riskScore);
}
