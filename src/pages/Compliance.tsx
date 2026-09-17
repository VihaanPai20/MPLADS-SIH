import { useMemo, useState } from 'react';
import { useMembers, useMLData } from '../hooks/useData';
import { FileWarning, CheckCircle2, AlertCircle } from 'lucide-react';
import type { MemberOfParliament } from '../types';

export function Compliance() {
  const { members, loading: membersLoading } = useMembers();
  const { mlRisk, loading: mlLoading } = useMLData();
  const [filter, setFilter] = useState('ALL');

  const complianceStats = useMemo(() => {
    if (!members || !mlRisk) return null;
    
    let compliant = 0;
    let exceptions = 0;
    const exceptionRecords: any[] = [];
    
    members.forEach((m: MemberOfParliament) => {
      const missingFields = [];
      if (!m.name) missingFields.push('Missing Name');
      if (!m.state) missingFields.push('Missing State');
      if (!m.constituency && m.house === 'Lok Sabha') missingFields.push('Missing Constituency (Lok Sabha)');
      
      // Integrate ML risk as compliance exceptions
      const risk = mlRisk.find((r: any) => r.member_id === m.id);
      if (risk) {
        if (risk.is_anomaly) missingFields.push('ML Flag: Statistical Cost Anomaly Detected');
        if (risk.is_duplicate) missingFields.push('ML Flag: High Similarity (Potential Duplicate Allocation)');
        if (risk.risk_level === 'CRITICAL') missingFields.push('ML Flag: Critical Execution Risk Profile');
      }

      if (missingFields.length > 0) {
        exceptions++;
        exceptionRecords.push({
          member: m,
          factors: missingFields.map(f => ({ evidence: f }))
        });
      } else {
        compliant++;
      }
    });

    return {
      compliant,
      exceptions,
      total: members.length,
      exceptionRecords
    };
  }, [members, mlRisk]);

  if (membersLoading || mlLoading) return <div className="p-8 text-mutedText">Loading compliance data...</div>;
  if (!complianceStats) return null;

  const filteredRecords = complianceStats.exceptionRecords.filter(r => {
    if (filter === 'ALL') return true;
    return r.member.house === filter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Compliance Dashboard</h1>
        <p className="text-mutedText mt-1 text-sm">
          Monitoring dataset adherence to mandatory geographical and biographical fields.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border border-brandBorder shadow-sm text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-palegreen text-secondaryText flex items-center justify-center mb-3">
            <FileWarning className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold text-charcoal">{complianceStats.total}</div>
          <div className="text-sm font-semibold text-mutedText uppercase mt-1">Total Records Checked</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-green-200 bg-green-50 shadow-sm text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-green-100 text-risk-low flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold text-risk-low">{complianceStats.compliant}</div>
          <div className="text-sm font-semibold text-risk-low uppercase mt-1">Fully Compliant</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-red-200 bg-red-50 shadow-sm text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold text-red-700">{complianceStats.exceptions}</div>
          <div className="text-sm font-semibold text-red-600 uppercase mt-1">Potential Exceptions</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-brandBorder shadow-sm overflow-hidden">
        <div className="p-4 border-b border-brandBorder bg-white flex justify-between items-center">
          <h3 className="font-bold text-charcoal">Exception Records</h3>
          <select 
            value={filter} 
            onChange={e => setFilter(e.target.value)}
            className="border border-brandBorder rounded px-3 py-1.5 text-sm"
          >
            <option value="ALL">All Houses</option>
            <option value="Lok Sabha">Lok Sabha</option>
            <option value="Rajya Sabha">Rajya Sabha</option>
          </select>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-mutedText border-b border-brandBorder">
              <tr>
                <th className="px-6 py-3 font-semibold">Member</th>
                <th className="px-6 py-3 font-semibold">House</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Missing Information</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredRecords.map((r, i) => (
                <tr key={i} className="hover:bg-white">
                  <td className="px-6 py-4">
                    <div className="font-medium text-charcoal">{r.member.name || 'UNKNOWN'}</div>
                    <div className="text-xs text-mutedText font-mono">{r.member.id}</div>
                  </td>
                  <td className="px-6 py-4 text-secondaryText">{r.member.house}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800">
                      Requires Verification
                    </span>
                  </td>
                  <td className="px-6 py-4 text-secondaryText">
                    <ul className="list-disc pl-4">
                      {r.factors.map((f: any, idx: number) => (
                        <li key={idx}>{f.evidence}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-mutedText">
                    No compliance exceptions found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
