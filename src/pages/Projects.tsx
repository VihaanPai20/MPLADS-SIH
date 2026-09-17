import { useState, useMemo } from 'react';
import { useMembers, useRiskAnalysis } from '../hooks/useData';
import { Search, Filter, AlertCircle } from 'lucide-react';


export function Projects() {
  const { members, loading } = useMembers();
  const { riskData, loading: riskLoading } = useRiskAnalysis();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const enrichedPortfolios = useMemo(() => {
    if (!members.length) return [];
    
    return members.map(m => {
      // Find risk
      let memberRisk = null;
      if (riskData) {
        memberRisk = riskData.results.find((r: any) => r.memberId === m.id);
      }
      
      return {
        id: `PRTF-${m.id}`,
        name: `${m.name} Entitlement Portfolio`,
        house: m.house,
        member: m.name,
        state: m.state,
        constituency: m.constituency || 'N/A',
        sanctioned: m.allocatedAmount,
        risk: memberRisk ? memberRisk.riskLevel : 'LOW',
        status: memberRisk && memberRisk.riskLevel === 'CRITICAL' ? 'AT RISK' : 'ONGOING', // Deterministic proxy
      };
    }).filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                            p.state.toLowerCase().includes(search.toLowerCase()) ||
                            (p.constituency && p.constituency.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [members, riskData, search, statusFilter]);

  const topKPIs = useMemo(() => {
    return {
      total: enrichedPortfolios.length,
      active: enrichedPortfolios.filter(p => p.status === 'ONGOING').length,
      atRisk: enrichedPortfolios.filter(p => p.status === 'AT RISK').length,
      totalSanctioned: enrichedPortfolios.reduce((sum, p) => sum + p.sanctioned, 0)
    };
  }, [enrichedPortfolios]);

  if (loading || riskLoading) return <div className="p-8 text-mutedText">Loading project monitoring engine...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Project Monitoring</h1>
        <p className="text-mutedText mt-1 text-sm">
          Monitor MPLADS works, financial progress, execution status and emerging risk signals.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex gap-3 text-sm text-amber-800 shadow-sm">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <p>
          <strong>Data Coverage Limitation:</strong> The source dataset contains Member-level allocations but lacks individual project data. This page currently monitors <strong>Member Entitlement Portfolios</strong> as the operational unit.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-brandBorder shadow-sm">
          <div className="text-[10px] font-bold text-mutedText uppercase tracking-wider mb-1">Total Portfolios</div>
          <div className="text-xl font-bold text-charcoal">{topKPIs.total.toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-brandBorder shadow-sm">
          <div className="text-[10px] font-bold text-mutedText uppercase tracking-wider mb-1">Active Portfolios</div>
          <div className="text-xl font-bold text-forest-deep">{topKPIs.active.toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-brandBorder shadow-sm border-l-4 border-l-red-500">
          <div className="text-[10px] font-bold text-mutedText uppercase tracking-wider mb-1">High Risk Portfolios</div>
          <div className="text-xl font-bold text-red-600">{topKPIs.atRisk.toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-brandBorder shadow-sm">
          <div className="text-[10px] font-bold text-mutedText uppercase tracking-wider mb-1">Total Sanctioned</div>
          <div className="text-xl font-bold text-charcoal">₹{(topKPIs.totalSanctioned / 10000000).toFixed(0)} Cr</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-brandBorder shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-brandBorder bg-white flex flex-col sm:flex-row gap-4 justify-between items-center relative">
          <div className="relative w-full sm:w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-mutedText" />
            <input 
              type="text" 
              placeholder="Search portfolios, states, constituencies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-brandBorder rounded-md focus:outline-none focus:ring-2 focus:ring-forest-primary text-sm"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-mutedText" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-brandBorder rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-primary"
            >
              <option value="ALL">All Statuses</option>
              <option value="ONGOING">Ongoing</option>
              <option value="AT RISK">At Risk</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-secondaryText min-w-[1000px]">
            <thead className="bg-white text-charcoal font-bold border-b border-brandBorder text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Project ID</th>
                <th className="px-6 py-4 w-64">Work / Project Name</th>
                <th className="px-6 py-4">State</th>
                <th className="px-6 py-4">Constituency</th>
                <th className="px-6 py-4 text-right">Sanctioned</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {enrichedPortfolios.slice(0, 100).map(p => (
                <tr key={p.id} className="hover:bg-white transition-colors cursor-pointer">
                  <td className="px-6 py-4 font-mono text-xs text-mutedText">{p.id}</td>
                  <td className="px-6 py-4 font-semibold text-charcoal">{p.name}</td>
                  <td className="px-6 py-4">{p.state}</td>
                  <td className="px-6 py-4">{p.constituency}</td>
                  <td className="px-6 py-4 text-right font-bold text-forest-deep">₹{(p.sanctioned / 10000000).toFixed(2)} Cr</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${p.status === 'AT RISK' ? 'bg-red-100 text-red-700' : 'bg-palegreen text-forest-deep'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {p.risk === 'CRITICAL' && <span className="text-red-600 font-bold">CRITICAL</span>}
                    {p.risk === 'HIGH' && <span className="text-orange-600 font-bold">HIGH</span>}
                    {p.risk === 'MODERATE' && <span className="text-yellow-600 font-bold">MODERATE</span>}
                    {p.risk === 'LOW' && <span className="text-risk-low font-bold">LOW</span>}
                  </td>
                </tr>
              ))}
              {enrichedPortfolios.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-mutedText">
                    No portfolios match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {enrichedPortfolios.length > 100 && (
            <div className="p-4 border-t border-brandBorder text-center text-xs text-mutedText bg-white">
              Showing first 100 results. Use filters to narrow your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
