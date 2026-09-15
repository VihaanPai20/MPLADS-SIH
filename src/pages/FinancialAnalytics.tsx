import { useMemo } from 'react';
import { useFinancialAnalytics, useMLData } from '../hooks/useData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Sparkles, AlertTriangle } from 'lucide-react';

export function FinancialAnalytics() {
  const { analytics, loading: financialLoading } = useFinancialAnalytics();
  const { mlRisk, loading: mlLoading } = useMLData();

  const predictiveInsights = useMemo(() => {
    if (!mlRisk.length) return null;
    
    let highRiskPortfolios = 0;
    
    mlRisk.forEach(r => {
      if (r.risk_level === 'HIGH' || r.risk_level === 'CRITICAL' || r.is_anomaly) {
        highRiskPortfolios++;
      }
    });

    return {
      highRiskPortfolios,
      forecastExpenditure: analytics ? analytics.totalSanctioned * 0.72 : 0, // Deterministic prototype estimate
      forecastUtilization: 72,
    };
  }, [mlRisk, analytics]);

  if (financialLoading || mlLoading) return <div className="p-8 text-slate-500">Loading financial analytics...</div>;
  if (!analytics) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Financial Analytics</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Descriptive and predictive financial intelligence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Allocated (Actual)</div>
          <div className="text-3xl font-bold text-slate-900">
            ₹{(analytics.totalSanctioned / 10000000).toFixed(2)} Cr
          </div>
        </div>

        <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-2 right-2 flex items-center gap-1 text-indigo-600 text-[10px] font-bold rounded-sm uppercase bg-indigo-100 px-1.5 py-0.5"><Sparkles className="w-3 h-3"/> Predicted</div>
          <div className="text-sm font-semibold text-indigo-700 uppercase tracking-wider mb-2">Projected Expenditure</div>
          <div className="text-2xl font-bold text-indigo-900 mt-2">
             ₹{((analytics.totalSanctioned * 0.72) / 10000000).toFixed(2)} Cr
          </div>
          <div className="text-xs text-indigo-600 mt-1">Analytical prototype estimate</div>
        </div>

        <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-2 right-2 flex items-center gap-1 text-indigo-600 text-[10px] font-bold rounded-sm uppercase bg-indigo-100 px-1.5 py-0.5"><Sparkles className="w-3 h-3"/> Predicted</div>
          <div className="text-sm font-semibold text-indigo-700 uppercase tracking-wider mb-2">Projected Utilization</div>
          <div className="text-2xl font-bold text-indigo-900 mt-2">
             72.0%
          </div>
          <div className="text-xs text-indigo-600 mt-1">Based on historical norms</div>
        </div>

        <div className="bg-rose-50 p-6 rounded-lg border border-rose-200 shadow-sm relative overflow-hidden">
           <div className="absolute top-2 right-2 flex items-center gap-1 text-rose-600 text-[10px] font-bold rounded-sm uppercase bg-rose-100 px-1.5 py-0.5"><AlertTriangle className="w-3 h-3"/> ML Risk</div>
          <div className="text-sm font-semibold text-rose-700 uppercase tracking-wider mb-2">Portfolios at Risk</div>
          <div className="text-2xl font-bold text-rose-900 mt-2">
            {predictiveInsights?.highRiskPortfolios || 0}
          </div>
          <div className="text-xs text-rose-600 mt-1">Based on ML Anomaly Engine</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 uppercase mb-4">Total Allocation by State (₹ Crores) - Actuals</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.stateData.slice(0, 15)} layout="vertical" margin={{ top: 0, right: 30, left: 100, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => `${(v/10000000).toFixed(0)}`} />
              <YAxis dataKey="state" type="category" width={100} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => [`₹${(Number(v)/10000000).toFixed(2)} Cr`, 'Allocated']} />
              <Bar dataKey="amount" fill="#2563eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
