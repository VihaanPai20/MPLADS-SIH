import { useMembers } from '../hooks/useData';
import { EmptyState } from '../components/EmptyState';
import { Building, MapPin } from 'lucide-react';

export function Districts() {
  const { loading } = useMembers();

  if (loading) return <div className="p-8 text-slate-500">Loading district intelligence...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">District Intelligence</h1>
        <p className="text-slate-500 mt-1 text-sm">
          District-level monitoring of projects, expenditure, execution and risk.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-sm font-bold text-slate-500 uppercase">Districts Covered</div>
          <div className="text-2xl font-bold mt-1 text-slate-400">N/A</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-sm font-bold text-slate-500 uppercase">Total Expenditure</div>
          <div className="text-2xl font-bold mt-1 text-slate-400">N/A</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-sm font-bold text-slate-500 uppercase">Avg Completion</div>
          <div className="text-2xl font-bold mt-1 text-slate-400">N/A</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-sm font-bold text-slate-500 uppercase">High-Risk Districts</div>
          <div className="text-2xl font-bold mt-1 text-slate-400">N/A</div>
        </div>
      </div>

      <div className="mt-8">
        <EmptyState
          title="District-Level Data Unavailable"
          description="The provided datasets contain Member-level allocations and their respective constituencies, but lack a formal district mapping and district-level project data. Geographic analysis is restricted to State-level in the Geographic module."
          icon={Building}
        />
      </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm min-h-[400px] flex items-center justify-center mt-6">
        <div className="text-center text-slate-400 max-w-md">
          <MapPin className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-bold text-slate-600 mb-2">District Performance Table</h3>
          <p className="text-sm">Cannot generate district performance rankings without district-mapped source data. Please integrate the District Nodal Authority sub-dataset to activate this module.</p>
        </div>
      </div>
    </div>
  );
}
