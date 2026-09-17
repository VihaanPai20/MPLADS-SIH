import { useState, useEffect } from 'react';
import { useHouse } from '../contexts/HouseContext';
import { getDashboardStats, getMembersByHouse, getMLStatus, trainMLModels, getMLRiskAnalysis } from '../services/api';
import type { DashboardStats, MemberOfParliament } from '../types';

export function useMLData() {
  const { house } = useHouse();
  const [mlStatus, setMLStatus] = useState<any>(null);
  const [mlRisk, setMLRisk] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    
    Promise.all([
      getMLStatus(),
      getMLRiskAnalysis(house)
    ]).then(([status, risk]) => {
      if (mounted) {
        setMLStatus(status);
        setMLRisk(risk);
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    return () => { mounted = false; };
  }, [house]);

  const train = async () => {
    setLoading(true);
    await trainMLModels();
    const risk = await getMLRiskAnalysis(house);
    setMLRisk(risk);
    const status = await getMLStatus();
    setMLStatus(status);
    setLoading(false);
  };

  return { mlStatus, mlRisk, loading, train };
}

export function useDashboardStats() {
  const { house } = useHouse();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getDashboardStats(house)
      .then(data => {
        if (mounted) {
          setStats(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, [house]);

  return { stats, loading, error };
}

export function useMembers() {
  const { house } = useHouse();
  const [members, setMembers] = useState<MemberOfParliament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getMembersByHouse(house)
      .then(data => {
        if (mounted) {
          setMembers(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, [house]);

  return { members, loading, error };
}

export function useDataQuality() {
  const { house } = useHouse();
  const [quality, setQuality] = useState<{ records: number; missingFields: number; potentialDuplicates: number; qualityScore: number } | null>(null);

  useEffect(() => {
    let mounted = true;
    import('../services/api').then(({ getDataQualityStats }) => {
      getDataQualityStats(house).then(data => {
        if (mounted) {
          setQuality(data);
        }
      });
    });
    return () => { mounted = false; };
  }, [house]);

  return quality;
}

export function useRiskAnalysis() {
  const { house } = useHouse();
  const [riskData, setRiskData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      import('../services/api').then(m => m.getMembersByHouse(house)),
      import('../services/api').then(m => m.getMLRiskAnalysis(house))
    ]).then(([members, mlRisks]) => {
      if (mounted) {
        // Map backend snake_case to frontend expected camelCase
        const mappedResults = mlRisks.map((r: any) => ({
          ...r,
          memberId: r.member_id,
          riskScore: r.overall_risk_score,
          riskLevel: r.risk_level,
          primarySignal: r.primary_signal,
        }));
        setRiskData({
          members,
          results: mappedResults
        });
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, [house]);

  return { riskData, loading };
}

export function useAlerts(resolvedAlerts: Set<string>) {
  const { riskData, loading: riskLoading } = useRiskAnalysis();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (riskLoading) return;
    
    setLoading(true);
    if (!riskData) {
      setAlerts([]);
      setLoading(false);
      return;
    }

    import('../services/alertEngine').then(({ generateAlerts }) => {
      if (mounted) {
        setAlerts(generateAlerts(riskData.members, riskData.results, resolvedAlerts));
        setLoading(false);
      }
    });

    return () => { mounted = false; };
  }, [riskData, riskLoading, resolvedAlerts]);

  return { alerts, loading: riskLoading || loading };
}

export function useFinancialAnalytics() {
  const { members, loading: membersLoading } = useMembers();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (membersLoading) return;

    setLoading(true);
    if (!members.length) {
      setAnalytics(null);
      setLoading(false);
      return;
    }

    import('../services/analyticsEngine').then(({ generateFinancialAnalytics }) => {
      if (mounted) {
        setAnalytics(generateFinancialAnalytics(members));
        setLoading(false);
      }
    });

    return () => { mounted = false; };
  }, [members, membersLoading]);

  return { analytics, loading: membersLoading || loading };
}

export function useGeographicAnalytics() {
  const { members, loading: membersLoading } = useMembers();
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (membersLoading) return;

    setLoading(true);
    if (!members.length) {
      setAnalytics([]);
      setLoading(false);
      return;
    }

    import('../services/analyticsEngine').then(({ generateGeographicAnalytics }) => {
      if (mounted) {
        setAnalytics(generateGeographicAnalytics(members));
        setLoading(false);
      }
    });

    return () => { mounted = false; };
  }, [members, membersLoading]);

  return { analytics, loading: membersLoading || loading };
}
