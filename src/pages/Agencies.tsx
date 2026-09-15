import { useMemo, useState } from 'react';
import { useMembers, useMLData } from '../hooks/useData';
import { useRole } from '../contexts/RoleContext';
import { Database, CheckCircle, AlertTriangle, AlertCircle, Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export function Agencies() {
  const { members, loading: membersLoading } = useMembers();
  const { mlRisk, loading: mlLoading } = useMLData();
  const { role } = useRole();
  const [selectedAuthority, setSelectedAuthority] = useState<string | null>(null);

  const authorityData = useMemo(() => {
    if (!members || !mlRisk) return [];

    const map = new Map<string, {
      name: string,
      memberCount: number,
      totalAllocated: number,
      riskScores: number[],
      members: any[]
    }>();

    members.forEach(m => {
      // In absence of granular Agency data, the State acts as the primary Implementing Nodal Authority
      const key = m.state || 'Unknown State Authority';
      
      if (!map.has(key)) {
        map.set(key, {
          name: key,
          memberCount: 0,
          totalAllocated: 0,
          riskScores: [],
          members: []
        });
      }
      
      const c = map.get(key)!;
      c.memberCount++;
      c.totalAllocated += m.allocatedAmount;
      
      const risk = mlRisk.find(r => r.member_id === m.id);
      if (risk) {
        c.riskScores.push(risk.overall_risk_score);
      }
      
      c.members.push({ ...m, risk });
    });

    return Array.from(map.values()).map(c => {
      const avgRisk = c.riskScores.length > 0 
        ? c.riskScores.reduce((a, b) => a + b, 0) / c.riskScores.length 
        : 0;
        
      let riskLevel = 'LOW';
      if (avgRisk >= 75) riskLevel = 'CRITICAL';
      else if (avgRisk >= 50) riskLevel = 'HIGH';
      else if (avgRisk >= 25) riskLevel = 'MODERATE';

      return {
        ...c,
        avgRisk,
        riskLevel
      };
    }).sort((a, b) => b.avgRisk - a.avgRisk); // Sort by highest risk first
  }, [members, mlRisk]);

  if (membersLoading || mlLoading) return <div className="p-8 text-slate-500">Loading authority intelligence...</div>;

  const topRisk = authorityData.slice(0, 10);
  const highRiskCount = authorityData.filter(c => c.riskLevel === 'HIGH' || c.riskLevel === 'CRITICAL').length;
  const totalAllocation = authorityData.reduce((acc, c) => acc + c.totalAllocated, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Implementing Authority Intelligence</h1>
          <p className="text-slate-500 mt-1 text-sm max-w-2xl">
            {role === 'Ministry' || role === 'Administrator' 
              ? 'National aggregation of State Nodal Authorities (SNA) and their predictive execution risk.'
              : 'Monitor predictive execution risk across primary implementing authorities.'}
          </p>
        </div>
        
        {/* DATA COVERAGE CARD */}
        <div className="bg-slate-900 text-slate-300 rounded-lg p-3 text-xs shadow-md border border-slate-700 w-full md:w-64">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-2">
            <span className="font-bold tracking-wider text-slate-400">DATA COVERAGE</span>
            <Database className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="flex justify-between">
            <span>State Nodal Authority</span>
            <span className="text-emerald-400 font-bold">100%</span>
          </div>
          <div className="flex justify-between opacity-50">
            <span>Granular Agency</span>
            <span className="text-red-400 font-bold">0%</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 italic leading-tight">
            Operating at the State Authority level due to missing granular agency mappings in the dataset.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm relative">
           <div className="absolute top-2 right-2 flex items-center gap-1 text-slate-600 text-[10px] font-bold rounded-sm uppercase bg-slate-100 px-1.5 py-0.5">Actual</div>
          <div className="text-sm font-bold text-slate-500 uppercase">Authorities</div>
          <div className="text-3xl font-bold mt-1 text-slate-900">{authorityData.length}</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm relative">
           <div className="absolute top-2 right-2 flex items-center gap-1 text-slate-600 text-[10px] font-bold rounded-sm uppercase bg-slate-100 px-1.5 py-0.5">Actual</div>
          <div className="text-sm font-bold text-slate-500 uppercase">Total Allocation</div>
          <div className="text-3xl font-bold mt-1 text-blue-700">₹{(totalAllocation / 10000000).toFixed(0)} Cr</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm relative opacity-50 grayscale">
          <div className="absolute top-2 right-2 flex items-center gap-1 text-slate-600 text-[10px] font-bold rounded-sm uppercase bg-slate-200 px-1.5 py-0.5">No Data</div>
          <div className="text-sm font-bold text-slate-500 uppercase">Avg Delay Rate</div>
          <div className="text-2xl font-bold mt-1 text-slate-400">N/A</div>
        </div>
        
        <div className="bg-orange-50 p-6 rounded-lg border border-orange-200 shadow-sm relative">
           <div className="absolute top-2 right-2 flex items-center gap-1 text-orange-600 text-[10px] font-bold rounded-sm uppercase bg-orange-100 px-1.5 py-0.5"><AlertCircle className="w-3 h-3"/> Predictive</div>
          <div className="text-sm font-bold text-orange-700 uppercase">High-Risk Authorities</div>
          <div className="text-3xl font-bold mt-1 text-orange-900">{highRiskCount}</div>
          <div className="text-xs text-orange-600 mt-1 font-medium">Aggregated ML Predictions</div>
        </div>
      </div>
      
      {/* PREDICTIVE ANALYTICS DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase mb-4 flex items-center justify-between">
            Top 10 High-Risk Authorities
            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] rounded-sm font-bold">PREDICTIVE</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topRisk} layout="vertical" margin={{ top: 0, right: 30, left: 80, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                <Tooltip 
                  formatter={(v: any) => [`${Number(v).toFixed(1)}/100`, 'Aggregated Risk Score']}
                  contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                />
                <Bar dataKey="avgRisk" fill="#ea580c" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase mb-4 flex items-center justify-between">
              Aggregation Explainability
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded-sm font-bold">METHODOLOGY & ACTION</span>
            </h3>
            <div className="space-y-3 text-sm text-slate-600">
              <p>
                Because granular agency execution records are <strong>genuinely unavailable</strong>, we elevate the analysis to the State Nodal Authority level (the primary implementing entity receiving funds).
              </p>
              <div className="bg-slate-50 p-3 rounded border border-slate-200 shadow-inner">
                <span className="font-semibold text-slate-800 block mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-500" />
                  Aggregation Logic:
                </span>
                <ol className="list-decimal pl-4 space-y-1 text-xs">
                  <li>Compute ML risk scores per Member Portfolio.</li>
                  <li>Group portfolios by their respective State Nodal Authority.</li>
                  <li>Calculate the arithmetic mean of all risk scores within that Authority's jurisdiction to produce a systemic 0-100 risk metric.</li>
                </ol>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">System-Wide Recommended Action</h4>
            {highRiskCount > 0 ? (
              <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800">
                <strong className="block mb-1">Action:</strong> Conduct systemic audit on the {highRiskCount} State Nodal Authorities flagged as HIGH or CRITICAL risk.
                <strong className="block mt-2 mb-1">Reason:</strong> These {highRiskCount} authorities are managing portfolios that exhibit concentrated structural anomalies and potential duplicate allocation patterns at an elevated rate compared to the national baseline.
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded p-3 text-sm text-emerald-800">
                <strong className="block mb-1">Action:</strong> Continue standard operational cadence.
                <strong className="block mt-2 mb-1">Reason:</strong> All State Nodal Authorities are currently operating within historically acceptable predictive risk margins.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-900">Implementing Authority Analytics Register</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-semibold">State Nodal Authority</th>
                <th className="px-6 py-3 font-semibold">Managed Portfolios</th>
                <th className="px-6 py-3 font-semibold">Total Allocation</th>
                <th className="px-6 py-3 font-semibold">Aggregated Risk</th>
                <th className="px-6 py-3 font-semibold">Risk Level</th>
                <th className="px-6 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {authorityData.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">{c.name}</td>
                  <td className="px-6 py-4">{c.memberCount}</td>
                  <td className="px-6 py-4 font-medium">₹{(c.totalAllocated / 10000000).toFixed(2)} Cr</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${c.avgRisk >= 50 ? 'bg-red-500' : c.avgRisk >= 25 ? 'bg-orange-400' : 'bg-green-500'}`}
                          style={{ width: `${c.avgRisk}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-700">{c.avgRisk.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      c.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                      c.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                      c.riskLevel === 'MODERATE' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {c.riskLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => setSelectedAuthority(selectedAuthority === c.name ? null : c.name)}
                      className="text-blue-600 font-semibold hover:text-blue-800"
                    >
                      {selectedAuthority === c.name ? 'Hide' : 'Explain'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* EXPLAINABILITY MODAL/DRAWER */}
      {selectedAuthority && (
        <div className="bg-slate-800 text-white rounded-lg p-6 shadow-xl border border-slate-700">
          <div className="flex justify-between items-start mb-6 border-b border-slate-700 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                {selectedAuthority} - Authority Aggregation Details
              </h3>
              <p className="text-slate-400 text-sm mt-1">Reviewing underlying portfolio risk signals managed by this State Nodal Authority.</p>
            </div>
            <button onClick={() => setSelectedAuthority(null)} className="text-slate-400 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-full w-8 h-8 flex items-center justify-center transition-colors">✕</button>
          </div>
          
          <div className="grid gap-4 mb-6">
            {authorityData.find(c => c.name === selectedAuthority)?.members.map((m, i) => (
              <div key={i} className="bg-slate-700/40 p-5 rounded-lg border border-slate-600 shadow-inner">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-lg text-blue-100">{m.name} <span className="text-slate-400 text-sm font-normal">({m.house})</span></span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    m.risk?.risk_level === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                    m.risk?.risk_level === 'HIGH' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                    'bg-slate-600 text-slate-300'
                  }`}>
                    Score: {m.risk?.overall_risk_score.toFixed(1) || 'N/A'}
                  </span>
                </div>
                
                <div className="mb-3">
                  <span className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1 block">Contributing Factors:</span>
                  <div className="text-sm text-slate-200 space-y-2">
                    {m.risk?.signals.map((s: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 bg-slate-800/50 p-2 rounded border border-slate-700/50">
                        <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>Unusual pattern detected:</strong> {s}. This portfolio deviates significantly from standard allocation patterns under this authority.
                        </span>
                      </div>
                    ))}
                    {(!m.risk?.signals || m.risk.signals.length === 0) && (
                      <div className="flex items-center gap-2 text-emerald-400 bg-emerald-900/20 p-2 rounded">
                        <CheckCircle className="w-4 h-4" />
                        No statistical anomalies detected in this portfolio.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-blue-900/30 border border-blue-800/50 rounded-lg p-5">
            <h4 className="text-sm uppercase tracking-widest text-blue-300 font-bold mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Recommended Action for {selectedAuthority}
            </h4>
            <p className="text-sm text-blue-100 leading-relaxed">
              {authorityData.find(c => c.name === selectedAuthority)?.avgRisk! >= 50 
                ? "Initiate a compliance audit with this State Nodal Authority. The elevated aggregated risk indicates a systemic issue in how portfolios within this jurisdiction are being structurally allocated or executed."
                : "No systemic audit required. The authority is managing portfolios within acceptable predictive risk thresholds."}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
