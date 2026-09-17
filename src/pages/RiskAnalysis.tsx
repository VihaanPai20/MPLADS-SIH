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

      if (r.primary_signal && r.primary_signal !== 'Normal Baseline Profile') {
        const signalName = r.primary_signal.split(' (')[0]; // Simplify name for chart
        anomalyTypes[signalName] = (anomalyTypes[signalName] || 0) + 1;
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

  if (mlLoading || membersLoading) return <div className="p-8 text-mutedText">Loading ML Predictive Engine...</div>;
  
  if (!mlRisk || mlRisk.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center bg-white border border-brandBorder rounded-lg h-96">
        <BrainCircuit className="w-12 h-12 text-mutedText mb-4" />
        <h2 className="text-xl font-bold text-charcoal">ML Engine Untrained</h2>
        <p className="text-mutedText mt-2 mb-6">The machine learning models require training on the current dataset.</p>
        <button onClick={train} className="px-6 py-2 bg-forest-primary text-white rounded-md font-semibold shadow hover:bg-forest-deep">
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
          <h1 className="text-2xl font-bold text-charcoal flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-forest-primary" />
            Machine Learning Intelligence
          </h1>
          <p className="text-mutedText mt-1 text-sm">
            Predictive risk modeling utilizing Isolation Forests and TF-IDF similarity.
          </p>
        </div>
        
        {/* ML Status Banner */}
        <div className="bg-palegreen border border-brandBorder text-forest-dark px-4 py-2 rounded-md text-sm font-semibold flex items-center shadow-sm">
          <Activity className="w-4 h-4 mr-2" />
          ML Pipeline: {mlStatus?.status.toUpperCase() || 'ACTIVE'}
        </div>
      </div>
      
      {/* Model Health Section */}
      {mlStatus && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mlStatus.models.map((m: any, i: number) => (
            <div key={i} className="bg-white p-4 rounded-lg border border-brandBorder shadow-sm flex justify-between items-center">
              <div>
                <div className="font-bold text-charcoal">{m.name}</div>
                <div className="text-xs text-mutedText">{m.algorithm} • {m.type}</div>
              </div>
              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${m.status === 'Active' ? 'bg-palegreen text-forest-deep' : 'bg-palegreen text-secondaryText'}`}>
                {m.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* KPIs */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-lg border border-brandBorder shadow-sm text-center">
            <div className="text-2xl font-bold text-charcoal">{stats.total}</div>
            <div className="text-xs font-semibold text-mutedText uppercase mt-1">Records Analyzed</div>
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
            <div className="text-2xl font-bold text-risk-low">{stats.low}</div>
            <div className="text-xs font-semibold text-risk-low uppercase mt-1">Low Risk</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-brandBorder shadow-sm text-center">
            <div className="text-2xl font-bold text-charcoal">{stats.anomalies}</div>
            <div className="text-xs font-semibold text-mutedText uppercase mt-1">Anomalies Detected</div>
          </div>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-brandBorder shadow-sm lg:col-span-1">
            <h3 className="text-sm font-bold text-charcoal uppercase mb-4">Risk Distribution</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={stats.distribution} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    innerRadius="60%" 
                    outerRadius="80%"
                  >
                    {stats.distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-brandBorder shadow-sm lg:col-span-2">
            <h3 className="text-sm font-bold text-charcoal uppercase mb-4">Predicted Anomaly Types</h3>
            {stats.anomalyData.length > 0 ? (
               <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.anomalyData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={130} 
                      tick={{ fontSize: 12, fill: '#475569' }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                    <Bar 
                      dataKey="count" 
                      fill="#356B52" 
                      radius={[0, 4, 4, 0]} 
                      barSize={40}
                      label={{ position: 'right', fill: '#334155', fontSize: 12, fontWeight: 'bold' }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-mutedText">
                 No anomalies detected by the Isolation Forest model.
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* High Risk Table */}
        <div className="bg-white rounded-lg border border-brandBorder shadow-sm flex-1 overflow-hidden">
          <div className="p-4 border-b border-brandBorder bg-white flex items-center">
            <ShieldAlert className="w-5 h-5 text-red-600 mr-2" />
            <h3 className="font-bold text-charcoal">Highest Risk Portfolios</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-mutedText border-b border-brandBorder">
                <tr>
                  <th className="px-4 py-3 font-semibold">Member / ID</th>
                  <th className="px-4 py-3 font-semibold">State / House</th>
                  <th className="px-4 py-3 font-semibold">ML Risk Level</th>
                  <th className="px-4 py-3 font-semibold">Score</th>
                  <th className="px-4 py-3 font-semibold">Primary Signal</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {highRiskMembers.slice(0, 15).map((item: any) => (
                  <tr 
                    key={item.member.id} 
                    className={`hover:bg-white cursor-pointer ${selectedRisk?.member.id === item.member.id ? 'bg-palegreen' : ''}`}
                    onClick={() => setSelectedRisk(item)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-charcoal">{item.member.name}</div>
                      <div className="text-xs text-mutedText">{item.member.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-charcoal">{item.member.state}</div>
                      <div className="text-xs text-mutedText">{item.member.house}</div>
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
                    <td className="px-4 py-3 font-bold text-charcoal">{item.risk.overall_risk_score.toFixed(1)}</td>
                    <td className="px-4 py-3 text-secondaryText truncate max-w-[150px]">{item.risk.primary_signal || 'General Risk'}</td>
                    <td className="px-4 py-3 text-right">
                      <ChevronRight className="w-4 h-4 text-mutedText inline" />
                    </td>
                  </tr>
                ))}
                {highRiskMembers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-mutedText">
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
          <div className="w-full lg:w-96 bg-white rounded-lg border border-brandBorder shadow-sm flex flex-col shrink-0">
            <div className="p-4 border-b border-brandBorder bg-forest-deep text-white rounded-t-lg">
              <h3 className="font-bold text-lg mb-1">{selectedRisk.member.name}</h3>
              <div className="text-xs text-mutedText font-medium tracking-wider flex justify-between">
                <span>{selectedRisk.member.id}</span>
                <span>{selectedRisk.member.house}</span>
              </div>
            </div>
            <div className="p-4 flex-1">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <div className="text-sm text-mutedText font-bold uppercase tracking-wider mb-1">ML Risk Score</div>
                  <div className="text-3xl font-bold text-charcoal">{selectedRisk.risk.overall_risk_score.toFixed(1)}</div>
                </div>
                <div className={`px-3 py-1 rounded-md font-bold ${
                  selectedRisk.risk.risk_level === 'CRITICAL' ? 'bg-red-100 text-red-800 border border-red-200' : 
                  selectedRisk.risk.risk_level === 'HIGH' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                  'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {selectedRisk.risk.risk_level}
                </div>
              </div>

              <h4 className="text-sm font-bold text-charcoal uppercase mb-3 border-b border-brandBorder pb-2">Why was this flagged?</h4>
              
              <div className="space-y-4 mb-6">
                {selectedRisk.risk.signals.map((signal: string, i: number) => {
                  let explanation = "";
                  if (signal.includes('Isolation Forest')) {
                    explanation = `Algorithm identified the ₹${(selectedRisk.member.allocatedAmount/10000000).toFixed(2)} Cr sanction as highly unusual via unsupervised isolation.`;
                  } else if (signal.includes('Duplicate')) {
                    explanation = `Detected via TF-IDF Similarity (${(selectedRisk.risk.similarity_score || 0).toFixed(1)}%). Portfolio matches structural descriptors of another entity.`;
                  } else if (signal.includes('Regional Cost Spike')) {
                    explanation = `Execution Scale Anomaly. Funding deviates more than 2 standard deviations above the ${selectedRisk.member.state} mean.`;
                  } else if (signal.includes('Deficit Funding')) {
                    explanation = `Execution Starvation Risk. Funding is >1.5 standard deviations below state average, indicating high risk of stall/abandonment.`;
                  } else if (signal.includes('Mega-Project')) {
                    explanation = `Complexity Risk. Allocation of ₹${(selectedRisk.member.allocatedAmount/10000000).toFixed(2)} Cr is in the top 5% nationally, increasing multi-stage failure probabilities.`;
                  } else if (signal.includes('Elevated')) {
                    explanation = `Minor deviation detected compared to localized peer allocations.`;
                  } else {
                     explanation = `Standard statistical profile with no critical deviations.`;
                  }
                  
                  return (
                    <div key={i} className="bg-white rounded-md p-3 border border-brandBorder">
                      <div className="flex items-center text-charcoal font-semibold mb-1">
                        <AlertOctagon className="w-4 h-4 mr-2 text-red-500" />
                        {signal}
                      </div>
                      <p className="text-sm text-secondaryText mb-2">{explanation}</p>
                    </div>
                  );
                })}
              </div>

              <h4 className="text-sm font-bold text-charcoal uppercase mb-3 border-b border-brandBorder pb-2">Recommended Action</h4>
              <div className="flex items-start text-sm text-charcoal bg-palegreen p-3 rounded-md border border-brandBorder">
                <Info className="w-5 h-5 text-forest-primary mr-2 shrink-0 mt-0.5" />
                <p>
                  {selectedRisk.risk.risk_level === 'CRITICAL' 
                    ? "Immediate multi-level audit required. Freeze unreleased tranches pending physical verification of mega-scale or anomalous assets."
                    : selectedRisk.risk.risk_level === 'HIGH'
                    ? "Flag for priority desk-review. Cross-reference stated outcomes against localized expenditure bounds before further clearance."
                    : "Maintain routine quarterly physical execution monitoring."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full lg:w-96 bg-white rounded-lg border border-brandBorder shadow-sm flex flex-col items-center justify-center p-8 shrink-0 text-center">
            <ShieldAlert className="w-12 h-12 text-mutedText mb-4" />
            <h3 className="font-bold text-mutedText">No Record Selected</h3>
            <p className="text-sm text-mutedText mt-2">Select a high-risk record from the table to view its ML explanation.</p>
          </div>
        )}
      </div>
    </div>
  );
}
