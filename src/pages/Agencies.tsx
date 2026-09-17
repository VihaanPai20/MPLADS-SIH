import React, { useMemo, useState } from 'react';
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

  if (membersLoading || mlLoading) return <div className="p-8 text-mutedText">Loading authority intelligence...</div>;

  const topRisk = authorityData.slice(0, 10);
  const highRiskCount = authorityData.filter(c => c.riskLevel === 'HIGH' || c.riskLevel === 'CRITICAL').length;
  const totalAllocation = authorityData.reduce((acc, c) => acc + c.totalAllocated, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Implementing Authority Intelligence</h1>
          <p className="text-mutedText mt-1 text-sm max-w-2xl">
            {role === 'Ministry' || role === 'Administrator' 
              ? 'National aggregation of State Nodal Authorities (SNA) and their predictive execution risk.'
              : 'Monitor predictive execution risk across primary implementing authorities.'}
          </p>
        </div>
        
        {/* DATA COVERAGE CARD */}
        <div className="bg-forest-deep text-mutedText rounded-lg p-3 text-xs shadow-md border border-forest-primary w-full md:w-64">
          <div className="flex items-center justify-between border-b border-forest-primary pb-2 mb-2">
            <span className="font-bold tracking-wider text-mutedText">DATA COVERAGE</span>
            <Database className="w-3 h-3 text-forest-secondary" />
          </div>
          <div className="flex justify-between">
            <span>State Nodal Authority</span>
            <span className="text-forest-secondary font-bold">100%</span>
          </div>
          <div className="flex justify-between opacity-50">
            <span>Granular Agency</span>
            <span className="text-red-400 font-bold">0%</span>
          </div>
          <div className="text-[10px] text-mutedText mt-1 italic leading-tight">
            Operating at the State Authority level due to missing granular agency mappings in the dataset.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-brandBorder shadow-sm relative">
           <div className="absolute top-2 right-2 flex items-center gap-1 text-secondaryText text-[10px] font-bold rounded-sm uppercase bg-palegreen px-1.5 py-0.5">Actual</div>
          <div className="text-sm font-bold text-mutedText uppercase">Authorities</div>
          <div className="text-3xl font-bold mt-1 text-charcoal">{authorityData.length}</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-brandBorder shadow-sm relative">
           <div className="absolute top-2 right-2 flex items-center gap-1 text-secondaryText text-[10px] font-bold rounded-sm uppercase bg-palegreen px-1.5 py-0.5">Actual</div>
          <div className="text-sm font-bold text-mutedText uppercase">Total Allocation</div>
          <div className="text-3xl font-bold mt-1 text-forest-deep">₹{(totalAllocation / 10000000).toFixed(0)} Cr</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-brandBorder shadow-sm relative">
          <div className="absolute top-2 right-2 flex items-center gap-1 text-secondaryText text-[10px] font-bold rounded-sm uppercase bg-palegreen px-1.5 py-0.5">Estimated</div>
          <div className="text-sm font-bold text-mutedText uppercase">Avg Delay Rate</div>
          <div className="text-3xl font-bold mt-1 text-charcoal">
            {authorityData.length > 0 ? (authorityData.reduce((acc, c) => acc + c.avgRisk, 0) / authorityData.length / 10).toFixed(1) : '0'} Mo
          </div>
        </div>
        
        <div className="bg-orange-50 p-6 rounded-lg border border-orange-200 shadow-sm relative">
           <div className="absolute top-2 right-2 flex items-center gap-1 text-orange-600 text-[10px] font-bold rounded-sm uppercase bg-orange-100 px-1.5 py-0.5"><AlertCircle className="w-3 h-3"/> Predictive</div>
          <div className="text-sm font-bold text-orange-700 uppercase">High-Risk Authorities</div>
          <div className="text-3xl font-bold mt-1 text-orange-900">{highRiskCount}</div>
          <div className="text-xs text-orange-600 mt-1 font-medium">Aggregated ML Predictions</div>
        </div>
      </div>
      
      {/* PREDICTIVE ANALYTICS DASHBOARD */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-lg border border-brandBorder shadow-sm">
          <h3 className="text-sm font-bold text-charcoal uppercase mb-4 flex items-center justify-between">
            Top 10 High-Risk Authorities
            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] rounded-sm font-bold">PREDICTIVE</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topRisk} layout="vertical" margin={{ top: 0, right: 30, left: 80, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                <Tooltip 
                  formatter={(v: any) => [`${Number(v).toFixed(1)}/100`, 'Aggregated Risk Score']}
                  contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                />
                <Bar dataKey="avgRisk" fill="#B29145" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-brandBorder shadow-sm overflow-hidden">
        <div className="p-4 border-b border-brandBorder bg-white flex justify-between items-center">
          <h3 className="font-bold text-charcoal">Implementing Authority Analytics Register</h3>
          {highRiskCount > 0 && (
            <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
              {highRiskCount} Authorities Require Audit
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-mutedText border-b border-brandBorder">
              <tr>
                <th className="px-6 py-3 font-semibold">State Nodal Authority</th>
                <th className="px-6 py-3 font-semibold">Managed Portfolios</th>
                <th className="px-6 py-3 font-semibold">Total Allocation</th>
                <th className="px-6 py-3 font-semibold">Aggregated Risk</th>
                <th className="px-6 py-3 font-semibold">Risk Level</th>
                <th className="px-6 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {authorityData.map((c, i) => (
                <React.Fragment key={i}>
                  <tr className={`transition-colors ${selectedAuthority === c.name ? 'bg-palegreen/50' : 'hover:bg-white'}`}>
                    <td className="px-6 py-4 font-semibold text-charcoal">{c.name}</td>
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
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        c.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                        c.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                        c.riskLevel === 'MODERATE' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-risk-low/20 text-risk-low'
                      }`}>
                        {c.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setSelectedAuthority(selectedAuthority === c.name ? null : c.name)}
                        className="text-forest-primary font-semibold hover:text-forest-deep bg-palegreen hover:bg-palegreen px-3 py-1 rounded transition-colors"
                      >
                        {selectedAuthority === c.name ? 'Hide Details' : 'Explain'}
                      </button>
                    </td>
                  </tr>
                  
                  {selectedAuthority === c.name && (
                    <tr>
                      <td colSpan={6} className="p-0 border-b border-brandBorder">
                        <div className="bg-forest-deep text-white p-6 shadow-inner">
                          <div className="flex justify-between items-start mb-6 border-b border-forest-primary pb-4">
                            <div>
                              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-forest-secondary" />
                                {c.name} - Authority Aggregation Details
                              </h3>
                              <p className="text-mutedText text-sm mt-1">Reviewing underlying portfolio risk signals managed by this State Nodal Authority.</p>
                            </div>
                            <button onClick={() => setSelectedAuthority(null)} className="text-mutedText hover:text-white bg-forest-deep hover:bg-brandBorder rounded-full w-8 h-8 flex items-center justify-center transition-colors">✕</button>
                          </div>
                          
                          <div className="grid gap-4 mb-6 md:grid-cols-2">
                            {c.members.map((m, idx) => (
                              <div key={idx} className="bg-forest-deep/40 p-4 rounded-lg border border-forest-primary shadow-inner">
                                <div className="flex justify-between items-center mb-3">
                                  <span className="font-bold text-forest-secondary truncate pr-2">{m.name} <span className="text-mutedText text-xs font-normal">({m.house})</span></span>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                                    m.risk?.risk_level === 'CRITICAL' ? 'bg-risk-critical/20 text-red-300 border border-red-500/30' :
                                    m.risk?.risk_level === 'HIGH' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                                    'bg-brandBorder text-mutedText'
                                  }`}>
                                    Score: {m.risk?.overall_risk_score.toFixed(1) || 'N/A'}
                                  </span>
                                </div>
                                
                                <div>
                                  <span className="text-[10px] uppercase tracking-widest text-mutedText font-bold mb-1 block">Contributing Factors:</span>
                                  <div className="text-xs text-mutedText space-y-2">
                                    {m.risk?.signals.map((s: string, sIdx: number) => (
                                      <div key={sIdx} className="flex items-start gap-1.5 bg-forest-deep/50 p-2 rounded border border-forest-primary/50">
                                        <AlertTriangle className="w-3 h-3 text-orange-400 shrink-0 mt-0.5" />
                                        <span>
                                          <strong>Unusual pattern detected:</strong> {s}
                                        </span>
                                      </div>
                                    ))}
                                    {(!m.risk?.signals || m.risk.signals.length === 0) && (
                                      <div className="flex items-center gap-1.5 text-forest-secondary bg-forest-deep/20 p-2 rounded">
                                        <CheckCircle className="w-3 h-3" />
                                        No statistical anomalies detected.
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="bg-forest-dark/30 border border-forest-primary/50 rounded-lg p-4">
                            <h4 className="text-sm uppercase tracking-widest text-forest-secondary font-bold mb-1 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Recommended Action
                            </h4>
                            <p className="text-sm text-forest-secondary">
                              {c.avgRisk >= 50 
                                ? "Initiate a compliance audit with this State Nodal Authority. The elevated aggregated risk indicates a systemic issue in how portfolios within this jurisdiction are being structurally allocated or executed."
                                : "No systemic audit required. The authority is managing portfolios within acceptable predictive risk thresholds."}
                            </p>
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
