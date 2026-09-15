import { useMemo, useState } from 'react';
import { useMembers, useMLData } from '../hooks/useData';
import { useRole } from '../contexts/RoleContext';
import { Database, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export function Districts() {
  const { members, loading: membersLoading } = useMembers();
  const { mlRisk, loading: mlLoading } = useMLData();
  const { role } = useRole();
  const [selectedConstituency, setSelectedConstituency] = useState<string | null>(null);

  const constituencyData = useMemo(() => {
    if (!members || !mlRisk) return [];

    const map = new Map<string, {
      name: string,
      state: string,
      memberCount: number,
      totalAllocated: number,
      riskScores: number[],
      members: any[]
    }>();

    members.forEach(m => {
      // For this module, we only analyze Lok Sabha constituencies since RS doesn't have constituencies
      if (m.house !== 'Lok Sabha' || !m.constituency) return;
      
      const key = `${m.constituency}, ${m.state}`;
      if (!map.has(key)) {
        map.set(key, {
          name: m.constituency,
          state: m.state,
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

  if (membersLoading || mlLoading) return <div className="p-8 text-slate-500">Loading constituency intelligence...</div>;

  const topRisk = constituencyData.slice(0, 10);
  const highRiskCount = constituencyData.filter(c => c.riskLevel === 'HIGH' || c.riskLevel === 'CRITICAL').length;
  const totalAllocation = constituencyData.reduce((acc, c) => acc + c.totalAllocated, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Constituency Intelligence</h1>
          <p className="text-slate-500 mt-1 text-sm max-w-2xl">
            {role === 'Ministry' || role === 'Administrator' 
              ? 'National constituency-level aggregation of portfolios and aggregated predictive risk.'
              : 'Constituency-level monitoring of projects, expenditure, and execution risk.'}
          </p>
        </div>
        
        {/* DATA COVERAGE CARD */}
        <div className="bg-slate-900 text-slate-300 rounded-lg p-3 text-xs shadow-md border border-slate-700 w-full md:w-64">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-2">
            <span className="font-bold tracking-wider text-slate-400">DATA COVERAGE</span>
            <Database className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="flex justify-between">
            <span>Constituency (Lok Sabha)</span>
            <span className="text-emerald-400 font-bold">100%</span>
          </div>
          <div className="flex justify-between">
            <span>District (Native)</span>
            <span className="text-red-400 font-bold">0%</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 italic leading-tight">
            Using 'Constituency' as the granular geographical entity due to lack of formal District mapping.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm relative">
           <div className="absolute top-2 right-2 flex items-center gap-1 text-slate-600 text-[10px] font-bold rounded-sm uppercase bg-slate-100 px-1.5 py-0.5">Actual</div>
          <div className="text-sm font-bold text-slate-500 uppercase">Constituencies</div>
          <div className="text-3xl font-bold mt-1 text-slate-900">{constituencyData.length}</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm relative">
           <div className="absolute top-2 right-2 flex items-center gap-1 text-slate-600 text-[10px] font-bold rounded-sm uppercase bg-slate-100 px-1.5 py-0.5">Actual</div>
          <div className="text-sm font-bold text-slate-500 uppercase">Total Allocation</div>
          <div className="text-3xl font-bold mt-1 text-blue-700">₹{(totalAllocation / 10000000).toFixed(0)} Cr</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm relative opacity-50 grayscale">
          <div className="absolute top-2 right-2 flex items-center gap-1 text-slate-600 text-[10px] font-bold rounded-sm uppercase bg-slate-200 px-1.5 py-0.5">No Data</div>
          <div className="text-sm font-bold text-slate-500 uppercase">Avg Completion</div>
          <div className="text-2xl font-bold mt-1 text-slate-400">N/A</div>
        </div>
        
        <div className="bg-orange-50 p-6 rounded-lg border border-orange-200 shadow-sm relative">
           <div className="absolute top-2 right-2 flex items-center gap-1 text-orange-600 text-[10px] font-bold rounded-sm uppercase bg-orange-100 px-1.5 py-0.5"><AlertCircle className="w-3 h-3"/> Predictive</div>
          <div className="text-sm font-bold text-orange-700 uppercase">High-Risk Regions</div>
          <div className="text-3xl font-bold mt-1 text-orange-900">{highRiskCount}</div>
          <div className="text-xs text-orange-600 mt-1 font-medium">Aggregated ML Predictions</div>
        </div>
      </div>
      
      {/* PREDICTIVE ANALYTICS DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase mb-4 flex items-center justify-between">
            Top 10 High-Risk Constituencies
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
        
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-center">
          <h3 className="text-sm font-bold text-slate-900 uppercase mb-4 flex items-center justify-between">
            Aggregation Explainability
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded-sm font-bold">METHODOLOGY</span>
          </h3>
          <div className="space-y-4 text-sm text-slate-600">
            <p>
              Because supervised ML models require historical project completion timelines and execution records which are <strong>genuinely unavailable</strong> in this dataset, we cannot train a constituency-level predictive model directly.
            </p>
            <p>
              Instead, we use <strong>Transparent Aggregated Predictive Intelligence</strong>.
            </p>
            <div className="bg-slate-50 p-4 rounded border border-slate-200">
              <span className="font-semibold text-slate-800 block mb-1">Aggregation Logic:</span>
              1. Compute Isolation Forest (Cost Anomaly) and Cosine Similarity (Duplicate) scores per Member Portfolio.<br/>
              2. Map Members to their Lok Sabha Constituency.<br/>
              3. Calculate the arithmetic mean of all Member Portfolio risk scores within that Constituency.<br/>
            </div>
            <p className="text-xs text-slate-500 italic mt-2">
              Note: Rajya Sabha portfolios are excluded from this view as they map to States, not Constituencies.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-900">Constituency Analytics Register</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-semibold">Constituency</th>
                <th className="px-6 py-3 font-semibold">State</th>
                <th className="px-6 py-3 font-semibold">Portfolios</th>
                <th className="px-6 py-3 font-semibold">Allocation</th>
                <th className="px-6 py-3 font-semibold">Aggregated Risk</th>
                <th className="px-6 py-3 font-semibold">Risk Level</th>
                <th className="px-6 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {constituencyData.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">{c.name}</td>
                  <td className="px-6 py-4 text-slate-600">{c.state}</td>
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
                      onClick={() => setSelectedConstituency(selectedConstituency === c.name ? null : c.name)}
                      className="text-blue-600 font-semibold hover:text-blue-800"
                    >
                      {selectedConstituency === c.name ? 'Hide' : 'Explain'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* EXPLAINABILITY MODAL/DRAWER */}
      {selectedConstituency && (
        <div className="bg-slate-800 text-white rounded-lg p-6 shadow-xl border border-slate-700">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-white">{selectedConstituency} - Aggregation Details</h3>
              <p className="text-slate-400 text-sm">Reviewing underlying portfolio risk signals that contributed to this constituency's aggregated score.</p>
            </div>
            <button onClick={() => setSelectedConstituency(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          
          <div className="grid gap-4">
            {constituencyData.find(c => c.name === selectedConstituency)?.members.map((m, i) => (
              <div key={i} className="bg-slate-700/50 p-4 rounded border border-slate-600">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold">{m.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    m.risk?.risk_level === 'CRITICAL' ? 'bg-red-500/20 text-red-300' :
                    m.risk?.risk_level === 'HIGH' ? 'bg-orange-500/20 text-orange-300' :
                    'bg-slate-600 text-slate-300'
                  }`}>
                    Score: {m.risk?.overall_risk_score.toFixed(1) || 'N/A'}
                  </span>
                </div>
                <div className="text-sm text-slate-300 space-y-1">
                  {m.risk?.signals.map((s: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3 text-orange-400" />
                      {s}
                    </div>
                  ))}
                  {(!m.risk?.signals || m.risk.signals.length === 0) && (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle className="w-3 h-3" />
                      No anomalies detected
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
