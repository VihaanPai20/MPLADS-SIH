import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { useMembers } from '../hooks/useData';

export function MembersOfParliament() {
  const [search, setSearch] = useState('');
  const [localHouseFilter, setLocalHouseFilter] = useState<string>('All');
  
  // Use global house filter via API abstraction hook
  const { members, loading, error } = useMembers();

  const filteredMps = useMemo(() => {
    return members.filter(mp => {
      const matchesSearch = mp.name.toLowerCase().includes(search.toLowerCase()) || 
                            mp.state.toLowerCase().includes(search.toLowerCase());
      const matchesHouse = localHouseFilter === 'All' || mp.house === localHouseFilter;
      return matchesSearch && matchesHouse;
    });
  }, [search, localHouseFilter, members]);

  if (loading) return <div className="p-8 text-slate-500">Loading MPs...</div>;
  if (error) return <div className="p-8 text-red-500">Error loading MPs: {error.message}</div>;


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Members of Parliament</h1>
          <p className="text-slate-500 mt-1 text-sm">
            View and manage Lok Sabha and Rajya Sabha representatives and their allocated funds.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name or state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <select 
            value={localHouseFilter}
            onChange={(e) => setLocalHouseFilter(e.target.value)}
            className="border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Local</option>
            <option value="Lok Sabha">Lok Sabha</option>
            <option value="Rajya Sabha">Rajya Sabha</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">ID / Sr.No</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">State</th>
                <th className="px-6 py-4">House</th>
                <th className="px-6 py-4">Role / Constituency</th>
                <th className="px-6 py-4 text-right">Allocated Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMps.slice(0, 100).map((mp) => (
                <tr key={mp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{mp.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{mp.name}</div>
                    {mp.term && <div className="text-xs text-slate-500 mt-0.5">{mp.term}</div>}
                  </td>
                  <td className="px-6 py-4">{mp.state}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      mp.house === 'Lok Sabha' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {mp.house}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {mp.constituency || mp.electedOrNominated || '-'}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-900">
                    ₹{mp.allocatedAmount.toLocaleString()}
                  </td>
                </tr>
              ))}
              {filteredMps.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No Members of Parliament found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {filteredMps.length > 100 && (
            <div className="px-6 py-4 border-t border-slate-200 text-center text-sm text-slate-500 bg-slate-50">
              Showing first 100 of {filteredMps.length} results. Use search to refine.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
