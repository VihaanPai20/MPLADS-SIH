import { useMembers } from '../hooks/useData';
import { EmptyState } from '../components/EmptyState';
import { Users, Briefcase, AlertTriangle } from 'lucide-react';

export function Agencies() {
  const { loading } = useMembers();

  if (loading) return <div className="p-8 text-slate-500">Loading agency intelligence...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Implementing Agency Intelligence</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Monitor project execution and performance across implementing agencies.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-sm font-bold text-slate-500 uppercase">Agencies</div>
          <div className="text-2xl font-bold mt-1 text-slate-400">N/A</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-sm font-bold text-slate-500 uppercase">Total Allocation</div>
          <div className="text-2xl font-bold mt-1 text-slate-400">N/A</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-sm font-bold text-slate-500 uppercase">Avg Delay Rate</div>
          <div className="text-2xl font-bold mt-1 text-slate-400">N/A</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-sm font-bold text-slate-500 uppercase">Risk Signals</div>
          <div className="text-2xl font-bold mt-1 text-slate-400">N/A</div>
        </div>
      </div>

      <div className="mt-8">
        <EmptyState
          title="Implementing Agency Data Unavailable"
          description="The source dataset does not contain mapping to Implementing Agencies (IA). Agency-level intelligence, expenditure tracking, and delay profiling require the Agency Implementation sub-dataset."
          icon={Users}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm min-h-[300px] flex items-center justify-center">
          <div className="text-center text-slate-400">
            <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-semibold text-slate-500">Agency Project Portfolio</p>
            <p className="text-sm mt-1">Requires Agency-to-Project mapping.</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm min-h-[300px] flex items-center justify-center">
          <div className="text-center text-slate-400">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-semibold text-slate-500">Unusual Patterns & Risk Signals</p>
            <p className="text-sm mt-1">Anomaly detection requires agency execution histories.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
