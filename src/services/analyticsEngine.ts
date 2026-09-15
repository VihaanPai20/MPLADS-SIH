import type { MemberOfParliament } from '../types';

export interface FinancialAnalytics {
  totalSanctioned: number;
  stateData: { state: string; amount: number }[];
}

export function generateFinancialAnalytics(members: MemberOfParliament[]): FinancialAnalytics {
  let totalSanctioned = 0;
  const stateMap = new Map<string, number>();

  members.forEach(m => {
    totalSanctioned += m.allocatedAmount;
    if (m.state) {
      stateMap.set(m.state, (stateMap.get(m.state) || 0) + m.allocatedAmount);
    }
  });

  const stateData = Array.from(stateMap.entries())
    .map(([state, amount]) => ({ state, amount }))
    .sort((a, b) => b.amount - a.amount);

  return { totalSanctioned, stateData };
}

export interface GeographicAnalytics {
  state: string;
  membersCount: number;
  allocation: number;
}

export function generateGeographicAnalytics(members: MemberOfParliament[]): GeographicAnalytics[] {
  const map = new Map<string, { state: string, membersCount: number, allocation: number }>();
  
  members.forEach(m => {
    if (!m.state) return;
    const data = map.get(m.state) || { state: m.state, membersCount: 0, allocation: 0 };
    data.membersCount++;
    data.allocation += m.allocatedAmount;
    map.set(m.state, data);
  });

  return Array.from(map.values()).sort((a, b) => b.allocation - a.allocation);
}
