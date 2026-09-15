export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type ProjectStatus = 'COMPLETED' | 'IN PROGRESS' | 'DELAYED' | 'PENDING' | 'UNDER REVIEW';
export type AlertStatus = 'OPEN' | 'UNDER REVIEW' | 'ACTION REQUIRED' | 'ESCALATED' | 'RESOLVED' | 'DISMISSED';

export interface Project {
  id: string;
  name: string;
  category: string;
  state: string;
  district: string;
  constituency: string;
  agency: string;
  sanctionedAmount: number;
  allocatedAmount: number;     // Parsed numerical value
  releasedAmount: number;
  expenditure: number;
  physicalProgress: number; // 0-100
  financialProgress: number; // 0-100
  sanctionDate: string;
  startDate: string;
  expectedCompletion: string;
  actualCompletion?: string;
  delayDays: number;
  riskScore: number;
  riskLevel: RiskLevel;
  status: ProjectStatus;
}

export interface Payment {
  id: string;
  projectId: string;
  date: string;
  amount: number;
  purpose: string;
  agency: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  isAnomaly: boolean;
}

export interface Alert {
  id: string;
  projectId: string;
  type: string;
  severity: RiskLevel;
  riskScore: number;
  detectedAt: string;
  evidence: string[];
  impact: string;
  recommendedAction: string;
  status: AlertStatus;
}

export interface RiskFactor {
  type: string;
  severity: RiskLevel;
  value: number | string;
  description: string;
}

export interface RiskAssessment {
  projectId: string;
  score: number;
  level: RiskLevel;
  confidence: number;
  factors: RiskFactor[];
}

export interface ComplianceRecord {
  id: string;
  projectId: string;
  category: string;
  status: 'COMPLIANT' | 'MINOR_EXCEPTION' | 'MAJOR_EXCEPTION' | 'PENDING';
  details: string;
}

export interface DashboardStats {
  totalWorks: number;
  totalSanctioned: number;
  totalExpenditure: number;
  fundUtilization: number;
  highRiskWorks: number;
  delayedWorks: number;
  complianceExceptions: number;
  potentialDuplicates: number;
}

export type HouseType = 'Lok Sabha' | 'Rajya Sabha';

export interface MemberOfParliament {
  id: string;
  srNo: number;
  state: string;
  name: string;
  term: string | null;
  house: HouseType;
  constituency: string | null;
  electedOrNominated: string | null;
  allocatedAmount: number;
}
