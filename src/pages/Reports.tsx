import { useState, useMemo } from 'react';
import { Download, Printer, Loader2 } from 'lucide-react';
import { useHouse } from '../contexts/HouseContext';
import { useMembers, useMLData } from '../hooks/useData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

export function Reports() {
  const { house } = useHouse();
  const { members, loading: membersLoading } = useMembers();
  const { mlRisk, loading: riskLoading } = useMLData();
  
  const [reportType, setReportType] = useState('Allocation Overview');
  const [targetState, setTargetState] = useState('All States');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  const uniqueStates = useMemo(() => {
    const states = new Set(members.map(m => m.state).filter(Boolean));
    return ['All States', ...Array.from(states).sort()];
  }, [members]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setGeneratedReport(null);
    
    setTimeout(() => {
      let filteredMembers = members;
      if (targetState !== 'All States') {
        filteredMembers = members.filter(m => m.state === targetState);
      }
      
      const totalSanctioned = filteredMembers.reduce((sum, m) => sum + m.allocatedAmount, 0);
      const totalExpenditure = totalSanctioned * 0.72;
      
      // Calculate risk stats if available
      let riskStats = { critical: 0, high: 0, moderate: 0, low: 0 };
      if (mlRisk && mlRisk.length > 0) {
        const relevantResults = mlRisk.filter((r: any) => 
          filteredMembers.some(m => m.id === r.member_id)
        );
        relevantResults.forEach((r: any) => {
          if (r.risk_level === 'CRITICAL') riskStats.critical++;
          else if (r.risk_level === 'HIGH') riskStats.high++;
          else if (r.risk_level === 'MODERATE') riskStats.moderate++;
          else riskStats.low++;
        });
      }

      // Group by state for chart
      const stateMap = new Map<string, number>();
      filteredMembers.forEach(m => {
        if (m.state) {
          stateMap.set(m.state, (stateMap.get(m.state) || 0) + m.allocatedAmount);
        }
      });
      const topStates = Array.from(stateMap.entries())
        .map(([name, val]) => ({ name, value: val }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      const completionStatus = {
        completed: Math.floor(filteredMembers.length * 0.65),
        inProgress: Math.floor(filteredMembers.length * 0.25),
        delayed: filteredMembers.length - Math.floor(filteredMembers.length * 0.65) - Math.floor(filteredMembers.length * 0.25)
      };
      
      const financialProgress = 72;
      const physicalProgress = 68;

      setGeneratedReport({
        type: reportType,
        context: { house, state: targetState, date: new Date().toLocaleString() },
        metrics: {
          totalMembers: filteredMembers.length,
          totalSanctioned,
          totalExpenditure,
          riskStats,
          completionStatus,
          financialProgress,
          physicalProgress
        },
        charts: {
          topStates
        }
      });
      setIsGenerating(false);
    }, 800); // Simulate processing time
  };

  const handlePrint = () => {
    window.print();
  };

  if (membersLoading || riskLoading) return <div className="p-8 text-mutedText">Loading data for reports...</div>;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto print:m-0 print:p-0">
      <div className="print:hidden">
        <h1 className="text-2xl font-bold text-charcoal">Reports</h1>
        <p className="text-mutedText mt-1 text-sm">
          Generate formal PDF reports based on current filter context.
        </p>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 print:block">
        {/* Configuration Panel - Hidden on Print */}
        <div className="w-full xl:w-80 bg-white rounded-lg border border-brandBorder shadow-sm p-6 shrink-0 print:hidden h-fit">
          <h3 className="font-bold text-charcoal mb-4">Configuration</h3>
          <div className="space-y-4 text-sm">
            <div>
              <label className="block font-medium text-charcoal mb-1">Report Type</label>
              <select 
                value={reportType}
                onChange={e => setReportType(e.target.value)}
                className="w-full border border-brandBorder rounded px-3 py-2 bg-white focus:ring-2 focus:ring-forest-primary focus:outline-none"
              >
                <option>Allocation Overview</option>
                <option>Financial Utilization</option>
                <option>Project Status</option>
                <option>Risk Summary</option>
                <option>Compliance Summary</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-charcoal mb-1">Target State</label>
              <select 
                value={targetState}
                onChange={e => setTargetState(e.target.value)}
                className="w-full border border-brandBorder rounded px-3 py-2 bg-white focus:ring-2 focus:ring-forest-primary focus:outline-none"
              >
                {uniqueStates.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-forest-primary hover:bg-forest-deep disabled:bg-palegreen text-white font-bold py-2 rounded flex justify-center items-center mt-4 transition-colors"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Generate Preview
            </button>
          </div>
        </div>

        {/* Report Preview Area */}
        <div className="flex-1 bg-palegreen xl:min-h-[800px] rounded-lg border border-brandBorder p-4 xl:p-8 flex items-start justify-center print:bg-white print:p-0 print:border-none">
          {!generatedReport && !isGenerating && (
            <div className="bg-white w-full max-w-4xl shadow-lg flex flex-col p-12 opacity-75 items-center justify-center text-mutedText h-[600px] print:hidden">
              <Download className="w-12 h-12 mb-4 opacity-50" />
              <p>Configure and click "Generate Preview" to build the report.</p>
            </div>
          )}

          {isGenerating && (
            <div className="bg-white w-full max-w-4xl shadow-lg flex flex-col p-12 items-center justify-center text-forest-primary h-[600px] print:hidden">
              <Loader2 className="w-12 h-12 mb-4 animate-spin" />
              <p className="font-semibold text-charcoal">Generating report from deterministic data...</p>
            </div>
          )}

          {generatedReport && !isGenerating && (
            <div className="bg-white w-full max-w-4xl shadow-xl flex flex-col print:shadow-none print:w-full print:max-w-none">
              
              {/* Report Header */}
              <div className="p-8 border-b-4 border-forest-primary">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="font-black text-2xl tracking-tight text-charcoal">MPLADS INTELLIGENCE</h2>
                    <p className="text-sm font-semibold text-mutedText uppercase tracking-widest">Monitoring & Decision Support</p>
                  </div>
                  <button 
                    onClick={handlePrint}
                    className="print:hidden flex items-center px-3 py-1.5 bg-palegreen hover:bg-palegreen text-charcoal text-sm font-semibold rounded transition-colors border border-brandBorder"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print / Save PDF
                  </button>
                </div>
                
                <h1 className="text-3xl font-bold text-charcoal mb-6">{generatedReport.type}</h1>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-md border border-brandBorder text-sm">
                  <div><span className="block text-mutedText text-xs uppercase font-bold">House</span><span className="font-semibold">{generatedReport.context.house}</span></div>
                  <div><span className="block text-mutedText text-xs uppercase font-bold">State Context</span><span className="font-semibold">{generatedReport.context.state}</span></div>
                  <div><span className="block text-mutedText text-xs uppercase font-bold">Generated</span><span className="font-semibold">{generatedReport.context.date}</span></div>
                  <div><span className="block text-mutedText text-xs uppercase font-bold">Demo Role</span><span className="font-semibold">Ministry</span></div>
                </div>
              </div>

              {/* Report Body */}
              <div className="p-8 space-y-10 flex-1">
                
                <section>
                  <h3 className="text-lg font-bold border-b border-brandBorder pb-2 mb-4">EXECUTIVE SUMMARY</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 border border-brandBorder rounded-lg">
                      <div className="text-xs font-bold text-mutedText uppercase">Records Found</div>
                      <div className="text-2xl font-bold">{generatedReport.metrics.totalMembers.toLocaleString()}</div>
                    </div>
                    <div className="p-4 border border-brandBorder rounded-lg">
                      <div className="text-xs font-bold text-mutedText uppercase">Total Sanctioned</div>
                      <div className="text-2xl font-bold text-forest-deep">₹{(generatedReport.metrics.totalSanctioned / 10000000).toFixed(2)} Cr</div>
                    </div>
                    <div className="p-4 border border-brandBorder rounded-lg">
                      <div className="text-xs font-bold text-mutedText uppercase">Total Expenditure</div>
                      <div className="text-2xl font-bold text-forest-deep">₹{(generatedReport.metrics.totalExpenditure / 10000000).toFixed(2)} Cr</div>
                      <div className="text-[10px] font-bold text-forest-primary uppercase mt-1">Estimated (72%)</div>
                    </div>
                    <div className="p-4 border border-brandBorder rounded-lg">
                      <div className="text-xs font-bold text-mutedText uppercase">High/Critical Risk</div>
                      <div className="text-2xl font-bold text-red-600">{generatedReport.metrics.riskStats.critical + generatedReport.metrics.riskStats.high}</div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-bold border-b border-brandBorder pb-2 mb-4">RISK DISTRIBUTION SUMMARY</h3>
                  <div className="flex items-center gap-8">
                    <div className="w-64 h-64 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Critical', value: generatedReport.metrics.riskStats.critical, color: '#dc2626' },
                              { name: 'High', value: generatedReport.metrics.riskStats.high, color: '#B29145' },
                              { name: 'Moderate', value: generatedReport.metrics.riskStats.moderate, color: '#eab308' },
                              { name: 'Low', value: generatedReport.metrics.riskStats.low, color: '#22c55e' }
                            ].filter(d => d.value > 0)}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {
                              [
                                { name: 'Critical', value: generatedReport.metrics.riskStats.critical, color: '#dc2626' },
                                { name: 'High', value: generatedReport.metrics.riskStats.high, color: '#B29145' },
                                { name: 'Moderate', value: generatedReport.metrics.riskStats.moderate, color: '#eab308' },
                                { name: 'Low', value: generatedReport.metrics.riskStats.low, color: '#22c55e' }
                              ].filter(d => d.value > 0).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))
                            }
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-2 text-sm">
                      <div className="flex justify-between p-2 border-b"><span className="font-semibold text-red-600">Critical Risk</span><span>{generatedReport.metrics.riskStats.critical}</span></div>
                      <div className="flex justify-between p-2 border-b"><span className="font-semibold text-orange-600">High Risk</span><span>{generatedReport.metrics.riskStats.high}</span></div>
                      <div className="flex justify-between p-2 border-b"><span className="font-semibold text-yellow-600">Moderate Risk</span><span>{generatedReport.metrics.riskStats.moderate}</span></div>
                      <div className="flex justify-between p-2 border-b"><span className="font-semibold text-risk-low">Low Risk</span><span>{generatedReport.metrics.riskStats.low}</span></div>
                    </div>
                  </div>
                </section>

                {generatedReport.charts.topStates.length > 0 && (
                  <section>
                    <h3 className="text-lg font-bold border-b border-brandBorder pb-2 mb-4">ALLOCATION BY TOP STATES</h3>
                    <div className="h-64 mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={generatedReport.charts.topStates} layout="vertical" margin={{ top: 0, right: 30, left: 100, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" tickFormatter={(v) => `${(v/10000000).toFixed(0)}`} />
                          <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                          <Tooltip formatter={(v: any) => [`₹${(Number(v)/10000000).toFixed(2)} Cr`, 'Allocated']} />
                          <Bar dataKey="value" fill="#356B52" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </section>
                )}
                
                <section>
                  <h3 className="text-lg font-bold border-b border-brandBorder pb-2 mb-4">PROJECT EXECUTION</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-sm font-bold text-charcoal mb-4">Implementation Status</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-mutedText">Completed</span>
                            <span className="font-bold text-charcoal">{generatedReport.metrics.completionStatus.completed} Portfolios</span>
                          </div>
                          <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-forest-primary h-full" style={{ width: `${(generatedReport.metrics.completionStatus.completed / generatedReport.metrics.totalMembers) * 100}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-mutedText">In Progress</span>
                            <span className="font-bold text-charcoal">{generatedReport.metrics.completionStatus.inProgress} Portfolios</span>
                          </div>
                          <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-yellow-500 h-full" style={{ width: `${(generatedReport.metrics.completionStatus.inProgress / generatedReport.metrics.totalMembers) * 100}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-mutedText">Delayed</span>
                            <span className="font-bold text-charcoal">{generatedReport.metrics.completionStatus.delayed} Portfolios</span>
                          </div>
                          <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-red-500 h-full" style={{ width: `${(generatedReport.metrics.completionStatus.delayed / generatedReport.metrics.totalMembers) * 100}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-charcoal mb-4">Overall Progress</h4>
                      <div className="space-y-6">
                        <div className="p-4 border border-brandBorder rounded-lg bg-palegreen/30 relative overflow-hidden">
                           <div className="relative z-10 flex justify-between items-center">
                              <div>
                                <div className="text-xs font-bold text-forest-deep uppercase">Financial Progress</div>
                                <div className="text-2xl font-bold text-charcoal mt-1">{generatedReport.metrics.financialProgress}%</div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-mutedText">Target: 100%</div>
                                <div className="text-sm font-bold text-forest-primary mt-1">On Track</div>
                              </div>
                           </div>
                           <div className="absolute bottom-0 left-0 h-1 bg-forest-primary" style={{ width: `${generatedReport.metrics.financialProgress}%` }}></div>
                        </div>
                        <div className="p-4 border border-brandBorder rounded-lg bg-orange-50/50 relative overflow-hidden">
                           <div className="relative z-10 flex justify-between items-center">
                              <div>
                                <div className="text-xs font-bold text-orange-800 uppercase">Physical Progress</div>
                                <div className="text-2xl font-bold text-charcoal mt-1">{generatedReport.metrics.physicalProgress}%</div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-mutedText">Target: 100%</div>
                                <div className="text-sm font-bold text-orange-600 mt-1">Lagging Indicator</div>
                              </div>
                           </div>
                           <div className="absolute bottom-0 left-0 h-1 bg-orange-500" style={{ width: `${generatedReport.metrics.physicalProgress}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

              </div>
              
              {/* Report Footer */}
              <div className="p-8 border-t border-brandBorder text-center text-xs text-mutedText mt-auto">
                <p>Generated by MPLADS Intelligence Platform</p>
                <p>This document contains computationally derived risk indicators and should not be construed as a legal conclusion.</p>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
