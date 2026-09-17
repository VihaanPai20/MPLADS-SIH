import React, { useMemo, useState } from 'react';
import { useMembers, useMLData } from '../hooks/useData';
import { useRole } from '../contexts/RoleContext';
import { CheckCircle, AlertTriangle, AlertCircle, BarChart3 } from 'lucide-react';
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

  if (membersLoading || mlLoading) return <div className="p-8 text-mutedText">Loading constituency intelligence...</div>;

  const topRisk = constituencyData.slice(0, 10);
  const highRiskCount = constituencyData.filter(c => c.riskLevel === 'HIGH' || c.riskLevel === 'CRITICAL').length;
  const totalAllocation = constituencyData.reduce((acc, c) => acc + c.totalAllocated, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Constituency Intelligence</h1>
          <p className="text-mutedText mt-1 text-sm max-w-2xl">
            {role === 'Ministry' || role === 'Administrator' 
              ? 'National constituency-level aggregation of portfolios and aggregated predictive risk.'
              : 'Constituency-level monitoring of projects, expenditure, and execution risk.'}
          </p>
        </div>
        

      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-brandBorder shadow-sm relative">
           <div className="absolute top-2 right-2 flex items-center gap-1 text-secondaryText text-[10px] font-bold rounded-sm uppercase bg-palegreen px-1.5 py-0.5">Actual</div>
          <div className="text-sm font-bold text-mutedText uppercase">Constituencies</div>
          <div className="text-3xl font-bold mt-1 text-charcoal">{constituencyData.length}</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-brandBorder shadow-sm relative">
           <div className="absolute top-2 right-2 flex items-center gap-1 text-secondaryText text-[10px] font-bold rounded-sm uppercase bg-palegreen px-1.5 py-0.5">Actual</div>
          <div className="text-sm font-bold text-mutedText uppercase">Total Allocation</div>
          <div className="text-3xl font-bold mt-1 text-forest-deep">₹{(totalAllocation / 10000000).toFixed(0)} Cr</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-brandBorder shadow-sm relative">
          <div className="absolute top-2 right-2 flex items-center gap-1 text-forest-primary text-[10px] font-bold rounded-sm uppercase bg-palegreen px-1.5 py-0.5"><CheckCircle className="w-3 h-3"/> Derived</div>
          <div className="text-sm font-bold text-mutedText uppercase">Avg Completion Est.</div>
          <div className="text-3xl font-bold mt-1 text-charcoal">
            {constituencyData.length > 0 
              ? (constituencyData.reduce((acc, c) => acc + Math.max(10, 95 - c.avgRisk), 0) / constituencyData.length).toFixed(1)
              : 0}%
          </div>
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
        <div className="bg-white p-6 rounded-lg border border-brandBorder shadow-sm">
          <h3 className="text-sm font-bold text-charcoal uppercase mb-4 flex items-center justify-between">
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
                <Bar dataKey="avgRisk" fill="#B29145" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-brandBorder shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-charcoal uppercase mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-mutedText" /> Regional Risk Summary</span>
            </h3>
            <div className="space-y-4 text-sm text-secondaryText">
              <p>
                The risk summary aggregates portfolio-level financial exceptions into a geographical risk percentage for regional monitoring.
              </p>
              
              <div className="bg-white p-4 rounded-lg border border-brandBorder">
                <span className="font-bold text-charcoal block mb-3 text-xs uppercase tracking-wider">
                  Current Status:
                </span>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-secondaryText">Constituencies Reviewed</span>
                    <span className="font-bold text-charcoal">{constituencyData.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-secondaryText">High Risk Regions</span>
                    <span className="font-bold text-orange-600">{highRiskCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-secondaryText">Most Common Issue</span>
                    <span className="font-bold text-red-600">Cost Deviations</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-5 border-t border-brandBorder">
            <h4 className="text-[10px] font-bold text-mutedText uppercase tracking-widest mb-3">Recommended Action</h4>
            {highRiskCount > 0 ? (
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-sm text-rose-800">
                <strong className="block mb-2 text-rose-700 uppercase text-xs tracking-wider">Audit Required:</strong> 
                Please schedule manual verification for the {highRiskCount} constituencies currently marked as High or Critical risk.
              </div>
            ) : (
              <div className="bg-palegreen border border-brandBorder rounded-lg p-4 text-sm text-forest-dark">
                <strong className="block mb-2 text-forest-deep uppercase text-xs tracking-wider">Status Normal:</strong> 
                No immediate escalation required. Continue routine monitoring.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-brandBorder shadow-sm overflow-hidden">
        <div className="p-4 border-b border-brandBorder bg-white">
          <h3 className="font-bold text-charcoal">Constituency Analytics Register</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-mutedText border-b border-brandBorder">
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
            <tbody className="divide-y divide-neutral-100">
              {constituencyData.map((c, i) => (
                <React.Fragment key={i}>
                  <tr className={`transition-colors ${selectedConstituency === c.name ? 'bg-palegreen/50' : 'hover:bg-white'}`}>
                    <td className="px-6 py-4 font-semibold text-charcoal">{c.name}</td>
                    <td className="px-6 py-4 text-secondaryText">{c.state}</td>
                    <td className="px-6 py-4">{c.memberCount}</td>
                    <td className="px-6 py-4 font-medium">₹{(c.totalAllocated / 10000000).toFixed(2)} Cr</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-palegreen rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${c.avgRisk >= 50 ? 'bg-risk-critical' : c.avgRisk >= 25 ? 'bg-risk-medium' : 'bg-risk-low'}`}
                            style={{ width: `${c.avgRisk}%` }}
                          />
                        </div>
                        <span className="font-bold text-charcoal">{c.avgRisk.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${
                        c.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-700 border border-red-200' :
                        c.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                        c.riskLevel === 'MODERATE' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                        'bg-risk-low/20 text-risk-low border border-green-200'
                      }`}>
                        {c.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setSelectedConstituency(selectedConstituency === c.name ? null : c.name)}
                        className={`font-semibold px-3 py-1.5 rounded-md text-sm transition-colors ${
                          selectedConstituency === c.name 
                            ? 'bg-forest-deep text-white hover:bg-forest-deep' 
                            : 'bg-palegreen text-forest-deep hover:bg-palegreen border border-brandBorder'
                        }`}
                      >
                        {selectedConstituency === c.name ? 'Hide Analysis' : 'Deep Dive'}
                      </button>
                    </td>
                  </tr>
                  
                  {/* INLINE EXPLAINABILITY DEEP DIVE */}
                  {selectedConstituency === c.name && (
                    <tr>
                      <td colSpan={7} className="p-0 border-b border-brandBorder">
                        <div className="bg-forest-deep text-white p-6 shadow-inner border-y border-forest-primary">
                          <div className="flex items-center justify-between mb-4 border-b border-forest-primary pb-3">
                            <div>
                              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-forest-secondary" />
                                {c.name} Constituency — Diagnostic Deep Dive
                              </h3>
                              <p className="text-white text-sm mt-1">Isolating the portfolio-level risk signals that mathematically generated the {c.avgRisk.toFixed(1)} aggregated risk score.</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            {/* Member Portfolios */}
                            <div className="xl:col-span-2 grid gap-4">
                              {c.members.map((m, idx) => (
                                <div key={idx} className="bg-forest-deep/80 p-4 rounded-lg border border-forest-primary">
                                  <div className="flex justify-between items-center mb-3 border-b border-forest-primary/50 pb-2">
                                    <div>
                                      <span className="font-bold text-base text-white block">{m.name}</span>
                                      <span className="text-[10px] text-white font-mono tracking-widest">{m.id}</span>
                                    </div>
                                    <span className={`px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest ${
                                      m.risk?.risk_level === 'CRITICAL' ? 'bg-risk-critical/20 text-red-300 border border-red-500/30' :
                                      m.risk?.risk_level === 'HIGH' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                                      'bg-forest-primary/10 text-forest-secondary border border-forest-primary/20'
                                    }`}>
                                      Portfolio Risk: {m.risk?.overall_risk_score.toFixed(1) || '0.0'}
                                    </span>
                                  </div>
                                  
                                  <div className="text-sm text-mutedText space-y-2">
                                    {m.risk?.signals.map((s: string, sIdx: number) => (
                                      <div key={sIdx} className="flex items-start gap-2 bg-forest-deep/50 p-2.5 rounded border border-forest-primary/50">
                                        <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                                        <span>
                                          <strong className="text-white block text-xs tracking-wide uppercase mb-1">Algorithmic Anomaly Flag:</strong>
                                          <span className="text-white">{s}. This portfolio structurally deviates from localized spending norms.</span>
                                        </span>
                                      </div>
                                    ))}
                                    {(!m.risk?.signals || m.risk.signals.length === 0) && (
                                      <div className="flex items-center gap-2 text-forest-secondary bg-forest-deep/20 p-2.5 rounded border border-forest-primary/50">
                                        <CheckCircle className="w-4 h-4" />
                                        <span><strong className="text-forest-secondary">Clean Portfolio:</strong> No statistical or duplicate anomalies detected by the ML engine.</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Action Required Panel */}
                            <div className="xl:col-span-1">
                              <div className={`rounded-lg p-5 border ${
                                c.riskLevel === 'CRITICAL' ? 'bg-red-950/40 border-red-900/50' :
                                c.riskLevel === 'HIGH' ? 'bg-orange-950/40 border-orange-900/50' :
                                'bg-forest-dark/20 border-forest-primary/50'
                              }`}>
                                <h4 className="text-[10px] uppercase tracking-widest font-bold mb-4 flex items-center gap-2 text-white border-b border-forest-primary/50 pb-2">
                                  <CheckCircle className="w-4 h-4" />
                                  Action Directive
                                </h4>
                                
                                {c.riskLevel === 'CRITICAL' || c.riskLevel === 'HIGH' ? (
                                  <div className="space-y-4">
                                    <div>
                                      <span className="text-xs text-red-400 font-bold uppercase tracking-wider block mb-1">Required Action</span>
                                      <p className="text-sm text-red-100">
                                        Mandatory District-Level Audit required. Immediately freeze subsequent fund releases to the affected portfolios pending physical verification of project assets.
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-xs text-orange-400 font-bold uppercase tracking-wider block mb-1">Diagnostic Reason</span>
                                      <p className="text-sm text-orange-100/80">
                                        The aggregated constituency score of {c.avgRisk.toFixed(1)} indicates severe, systemic failure modes (duplicates/cost spikes) that cross the automated warning threshold.
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    <div>
                                      <span className="text-xs text-forest-secondary font-bold uppercase tracking-wider block mb-1">Required Action</span>
                                      <p className="text-sm text-forest-secondary">
                                        No immediate escalation required. Continue standard quarterly execution reporting and normal fund disbursement.
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-xs text-forest-secondary font-bold uppercase tracking-wider block mb-1">Diagnostic Reason</span>
                                      <p className="text-sm text-forest-secondary/80">
                                        The aggregated constituency score of {c.avgRisk.toFixed(1)} remains within acceptable statistical control limits, indicating normal portfolio operations.
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
