import { useState, useRef, useEffect } from 'react';
import { Search, Bell } from 'lucide-react';
import { useHouse } from '../../contexts/HouseContext';
import type { GlobalHouseSelection } from '../../contexts/HouseContext';
import { useRole } from '../../contexts/RoleContext';
import type { RoleSelection } from '../../contexts/RoleContext';
import { useMembers } from '../../hooks/useData';
import { useNavigate } from 'react-router-dom';

const roles = [
  'Ministry',
  'State Nodal Authority',
  'District Authority',
  'Member of Parliament',
  'Administrator'
];

export function Topbar() {
  const { house, setHouse } = useHouse();
  const { role, setRole } = useRole();
  const { members } = useMembers();
  const navigate = useNavigate();
  
  const [search, setSearch] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults = search.length > 2 ? members.filter(m => {
    return (m.name && m.name.toLowerCase().includes(search.toLowerCase())) ||
           (m.state && m.state.toLowerCase().includes(search.toLowerCase())) ||
           (m.constituency && m.constituency.toLowerCase().includes(search.toLowerCase())) ||
           (m.id && m.id.toLowerCase().includes(search.toLowerCase()));
  }).slice(0, 5) : [];

  const handleSelectResult = (_id: string) => {
    setSearch('');
    setIsFocused(false);
    navigate('/mps'); 
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-50 sticky top-0 shadow-sm">
      <div className="flex items-center flex-1">
        <div className="relative w-96" ref={searchRef}>
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="w-4 h-4 text-slate-400" />
          </span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setIsFocused(true)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="Search members, states, or constituencies..."
          />
          
          {isFocused && search.length > 2 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-md shadow-lg border border-slate-200 text-slate-900 max-h-96 overflow-y-auto">
              {searchResults.length === 0 ? (
                <div className="p-4 text-sm text-slate-500 text-center">No results found.</div>
              ) : (
                <div className="py-2">
                  {searchResults.map(result => (
                    <div 
                      key={result.id} 
                      onClick={() => handleSelectResult(result.id)}
                      className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
                    >
                      <div className="font-semibold text-sm">{result.name}</div>
                      <div className="text-xs text-slate-500 flex gap-2 mt-1">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">{result.house}</span>
                        <span>{result.state}</span>
                        {result.constituency && <span>• {result.constituency}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">House:</span>
          <select 
            className="text-sm border-slate-300 rounded-md bg-slate-50 py-1.5 pl-3 pr-8 focus:ring-blue-500 focus:border-blue-500 text-slate-700 font-medium cursor-pointer"
            value={house}
            onChange={(e) => setHouse(e.target.value as GlobalHouseSelection)}
          >
            <option value="ALL">All</option>
            <option value="LOK_SABHA">Lok Sabha</option>
            <option value="RAJYA_SABHA">Rajya Sabha</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Demo Role:</span>
          <select 
            className="text-sm border-slate-300 rounded-md bg-slate-50 py-1.5 pl-3 pr-8 focus:ring-blue-500 focus:border-blue-500 text-slate-700 font-medium cursor-pointer"
            value={role}
            onChange={(e) => setRole(e.target.value as RoleSelection)}
          >
            {roles.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <button className="relative text-slate-500 hover:text-slate-700 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            3
          </span>
        </button>

        <div className="flex items-center space-x-3 pl-6 border-l border-slate-200">
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-700">Demo User</span>
            <span className="text-xs text-slate-500">{role}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
            DU
          </div>
        </div>
      </div>
    </header>
  );
}
