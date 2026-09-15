import type { Project, Payment, Alert, DashboardStats, RiskAssessment } from '../types';

export const mockDashboardStats: DashboardStats = {
  totalWorks: 12842,
  totalSanctioned: 48210000000,
  totalExpenditure: 37640000000,
  fundUtilization: 78.1,
  highRiskWorks: 347,
  delayedWorks: 621,
  complianceExceptions: 184,
  potentialDuplicates: 73,
};

export const mockProjects: Project[] = [
  {
    id: 'PRJ-2023-001',
    name: 'Construction of Community Hall at Village Rampur',
    category: 'Community Infrastructure',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    constituency: 'Varanasi',
    agency: 'PWD, Uttar Pradesh',
    sanctionedAmount: 2500000,
    allocatedAmount: 2500000,
    releasedAmount: 1250000,
    expenditure: 1100000,
    physicalProgress: 45,
    financialProgress: 44,
    sanctionDate: '2025-01-15',
    startDate: '2025-02-10',
    expectedCompletion: '2026-08-12',
    delayDays: 37,
    riskScore: 93,
    riskLevel: 'CRITICAL',
    status: 'IN PROGRESS',
  },
  {
    id: 'MPL-09821',
    name: 'Primary School Renovation',
    category: 'Education',
    state: 'Maharashtra',
    district: 'Pune',
    constituency: 'Pune',
    agency: 'PWD Maharashtra',
    sanctionedAmount: 1500000,
    allocatedAmount: 1500000,
    releasedAmount: 1500000,
    expenditure: 1450000,
    physicalProgress: 95,
    financialProgress: 96,
    sanctionDate: '2024-11-20',
    startDate: '2024-12-05',
    expectedCompletion: '2025-06-30',
    delayDays: 0,
    riskScore: 12,
    riskLevel: 'LOW',
    status: 'COMPLETED',
  }
];

export const mockPayments: Payment[] = [
  {
    id: 'PAY-0192',
    projectId: 'MPL-10482',
    date: '2026-08-12',
    amount: 1280000,
    purpose: 'Milestone Payment',
    agency: 'Agency A',
    status: 'COMPLETED',
    isAnomaly: true,
  }
];

export const mockAlerts: Alert[] = [
  {
    id: 'ALT-9921',
    projectId: 'MPL-10482',
    type: 'Financial / Physical mismatch',
    severity: 'CRITICAL',
    riskScore: 93,
    detectedAt: '2026-09-13',
    evidence: ['Financial progress 89%', 'Physical progress 47%'],
    impact: 'Potentially premature expenditure',
    recommendedAction: 'Verify physical work and measurement records before further payment.',
    status: 'OPEN'
  }
];

export const mockRiskAssessments: Record<string, RiskAssessment> = {
  'MPL-10482': {
    projectId: 'MPL-10482',
    score: 93,
    level: 'CRITICAL',
    confidence: 0.93,
    factors: [
      { type: 'PROGRESS_MISMATCH', severity: 'CRITICAL', value: 42, description: 'Financial/Physical mismatch' },
      { type: 'COST_DEVIATION', severity: 'HIGH', value: '14%', description: 'Cost deviation above threshold' },
      { type: 'DELAY', severity: 'HIGH', value: 37, description: 'Project delay detected' }
    ]
  }
};
