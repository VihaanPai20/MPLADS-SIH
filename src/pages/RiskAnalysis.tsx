import { useState, useMemo } from 'react';
import { useMLData, useMembers } from '../hooks/useData';
import type { MemberOfParliament } from '../types';
import { AlertOctagon, ShieldAlert, Info, ChevronRight, Activity, BrainCircuit } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

export function RiskAnalysis() {
  const { mlRisk, mlStatus, loading: mlLoading, train } = useMLData();
  const { members, loading: membersLoading } = useMembers();
  const [selectedRisk, setSelectedRisk] = useState<{ risk: any, member: MemberOfParliament } | null>(null);

  const stats = useMemo(() => {
    if (!mlRisk || mlRisk.length === 0) return null;
    let critical = 0;
    let high = 0;
    let moderate = 0;
    let low = 0;
    let anomalyTypes: Record<string, number> = {};

    mlRisk.forEach((r: any) => {
      if (r.risk_level === 'CRITICAL') critical++;
      if (r.risk_level === 'HIGH') high++;
      if (r.risk_level === 'MODERATE') moderate++;
      if (r.risk_level === 'LOW') low++;

      if (r.is_anomaly) {
        anomalyTypes['Cost Anomaly'] = (anomalyTypes['Cost Anomaly'] || 0) + 1;
      }
      if (r.is_duplicate) {
        anomalyTypes['Potential Duplicate'] = (anomalyTypes['Potential Duplicate'] || 0) + 1;
      }
    });

    return {
      total: mlRisk.length,
      critical, high, moderate, low,
      anomalies: Object.keys(anomalyTypes).reduce((acc, k) => acc + anomalyTypes[k], 0),
      anomalyData: Object.keys(anomalyTypes).map(k => ({ name: k, count: anomalyTypes[k] })),
      distribution: [
        { name: 'Critical', value: critical, color: '#b91c1c' },
        { name: 'High', value: high, color: '#c2410c' },
        { name: 'Moderate', value: moderate, color: '#d97706' },
        { name: 'Low', value: low, color: '#15803d' },
      ]
    };
  }, [mlRisk]);

  if (mlLoading || membersLoading) return <div className="p-8 text-slate-500">Loading ML Predictive Engine...</div>;
  
  if (!mlRisk || mlRisk.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-lg h-96">
        <BrainCircuit className="w-12 h-12 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">ML Engine Untrained</h2>
        <p className="text-slate-500 mt-2 mb-6">The machine learning models require training on the current dataset.</p>
        <button onClick={train} className="px-6 py-2 bg-blue-600 text-white rounded-md font-semibold shadow hover:bg-blue-700">
          Initialize & Train ML Models
        </button>
      </div>
    );
  }

  const highRiskMembers = mlRisk
    .filter((r: any) => r.risk_level === 'HIGH' || r.risk_level === 'CRITICAL' || r.is_anomaly || r.is_duplicate)
    .sort((a: any, b: any) => b.overall_risk_score - a.overall_risk_score)
    .map((r: any) => {
      const member = members.find((m: MemberOfParliament) => m.id === r.member_id);
      return { risk: r, member };
    })
    .filter((x: any) => x.member); // ensure match

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-blue-600" />
            Machine Learning Intelligence
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Predictive risk modeling utilizing Isolation Forests and TF-IDF similarity.
          </p>
        </div>
        
        {/* ML Status Banner */}
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-md text-sm font-semibold flex items-center shadow-sm">
          <Activity className="w-4 h-4 mr-2" />
          ML Pipeline: {mlStatus?.status.toUpperCase() || 'ACTIVE'}
        </div>
      </div>
      
      {/* Model Health Section */}
      {mlStatus && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mlStatus.models.map((m: any, i: number) => (
            <div key={i} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center">
              <div>
                <div className="font-bold text-slate-800">{m.name}</div>
                <div className="text-xs text-slate-500">{m.algorithm} • {m.type}</div>
              </div>
              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${m.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                {m.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* KPIs */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm text-center">
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase mt-1">Records Analyzed</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-red-200 bg-red-50 shadow-sm text-center">
            <div className="text-2xl font-bold text-red-700">{stats.critical}</div>
            <div className="text-xs font-semibold text-red-600 uppercase mt-1">Critical Risk</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-orange-200 bg-orange-50 shadow-sm text-center">
            <div className="text-2xl font-bold text-orange-700">{stats.high}</div>
            <div className="text-xs font-semibold text-orange-600 uppercase mt-1">High Risk</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-amber-200 bg-amber-50 shadow-sm text-center">
            <div className="text-2xl font-bold text-amber-700">{stats.moderate}</div>
            <div className="text-xs font-semibold text-amber-600 uppercase mt-1">Moderate Risk</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-green-200 bg-green-50 shadow-sm text-center">
            <div className="text-2xl font-bold text-green-700">{stats.low}</div>
            <div className="text-xs font-semibold text-green-600 uppercase mt-1">Low Risk</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm text-center">
            <div className="text-2xl font-bold text-slate-900">{stats.anomalies}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase mt-1">Anomalies Detected</div>
          </div>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm lg:col-span-1">
            <h3 className="text-sm font-bold text-slate-900 uppercase mb-4">Risk Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.distribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80}>
                    {stats.distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm lg:col-span-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase mb-4">Predicted Anomaly Types</h3>
            {stats.anomalyData.length > 0 ? (
               <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.anomalyData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                 No anomalies detected by the Isolation Forest model.
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* High Risk Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex-1 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center">
            <ShieldAlert className="w-5 h-5 text-red-600 mr-2" />
            <h3 className="font-bold text-slate-900">Highest Risk Portfolios</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Member / ID</th>
                  <th className="px-4 py-3 font-semibold">State / House</th>
                  <th className="px-4 py-3 font-semibold">ML Risk Level</th>
                  <th className="px-4 py-3 font-semibold">Score</th>
                  <th className="px-4 py-3 font-semibold">Primary Signal</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {highRiskMembers.slice(0, 15).map((item: any) => (
                  <tr 
                    key={item.member.id} 
                    className={`hover:bg-slate-50 cursor-pointer ${selectedRisk?.member.id === item.member.id ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedRisk(item)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{item.member.name}</div>
                      <div className="text-xs text-slate-500">{item.member.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-900">{item.member.state}</div>
                      <div className="text-xs text-slate-500">{item.member.house}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                        item.risk.risk_level === 'CRITICAL' ? 'bg-red-100 text-red-800' : 
                        item.risk.risk_level === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {item.risk.risk_level}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-700">{item.risk.overall_risk_score.toFixed(1)}</td>
                    <td className="px-4 py-3 text-slate-600 truncate max-w-[150px]">{item.risk.primary_signal || 'General Risk'}</td>
                    <td className="px-4 py-3 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-400 inline" />
                    </td>
                  </tr>
                ))}
                {highRiskMembers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      No high risk records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk Detail Panel */}
        {selectedRisk ? (
          <div className="w-full lg:w-96 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col shrink-0">
            <div className="p-4 border-b border-slate-200 bg-slate-900 text-white rounded-t-lg">
              <h3 className="font-bold text-lg mb-1">{selectedRisk.member.name}</h3>
              <div className="text-xs text-slate-400 font-medium tracking-wider flex justify-between">
                <span>{selectedRisk.member.id}</span>
                <span>{selectedRisk.member.house}</span>
              </div>
            </div>
            <div className="p-4 flex-1">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <div className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">ML Risk Score</div>
                  <div className="text-3xl font-bold text-slate-900">{selectedRisk.risk.overall_risk_score.toFixed(1)}</div>
                </div>
                <div className={`px-3 py-1 rounded-md font-bold ${
                  selectedRisk.risk.risk_level === 'CRITICAL' ? 'bg-red-100 text-red-800 border border-red-200' : 
                  selectedRisk.risk.risk_level === 'HIGH' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                  'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {selectedRisk.risk.risk_level}
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-900 uppercase mb-3 border-b border-slate-100 pb-2">Why was this flagged?</h4>
              
              <div className="space-y-4 mb-6">
                {selectedRisk.risk.signals.map((signal: string, i: number) => (
                  <div key={i} className="bg-slate-50 rounded-md p-3 border border-slate-200">
                    <div className="flex items-center text-slate-900 font-semibold mb-1">
                      <AlertOctagon className="w-4 h-4 mr-2 text-red-500" />
                      {signal}
                    </div>
                    {signal === 'Statistical Cost Anomaly' && (
                       <p className="text-sm text-slate-600 mb-2">Detected by Isolation Forest model. The sanctioned amount of ₹{(selectedRisk.member.allocatedAmount/10000000).toFixed(2)} Cr statistically deviates from the expected state distribution.</p>
                    )}
                    {signal === 'High Similarity (Potential Duplicate)' && (
                       <p className="text-sm text-slate-600 mb-2">Detected by TF-IDF + Cosine Similarity. The portfolio closely matches another record (Similarity: {selectedRisk.risk.similarity_score.toFixed(1)}%).</p>
                    )}
                  </div>
                ))}
                
                {selectedRisk.risk.signals.length === 0 && (
                  <p className="text-sm text-slate-500">Elevated baseline risk based on state/house factors without a specific critical ML anomaly.</p>
                )}
              </div>

              <h4 className="text-sm font-bold text-slate-900 uppercase mb-3 border-b border-slate-100 pb-2">Recommended Action</h4>
              <div className="flex items-start text-sm text-slate-700 bg-blue-50 p-3 rounded-md border border-blue-100">
                <Info className="w-5 h-5 text-blue-600 mr-2 shrink-0 mt-0.5" />
                <p>
                  {selectedRisk.risk.is_anomaly ? "Review expenditure and sanction records for statistical deviations." : 
                   selectedRisk.risk.is_duplicate ? "Verify project location, scope and sanction records for duplication." :
                   "Monitor portfolio execution and compliance."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full lg:w-96 bg-slate-50 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center justify-center p-8 shrink-0 text-center">
            <ShieldAlert className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="font-bold text-slate-400">No Record Selected</h3>
            <p className="text-sm text-slate-400 mt-2">Select a high-risk record from the table to view its ML explanation.</p>
          </div>
        )}
      </div>
    </div>
  );
}
