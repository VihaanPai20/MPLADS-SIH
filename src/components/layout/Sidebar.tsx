import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  AlertTriangle, 
  Bell, 
  ShieldCheck,
  TrendingUp,
  Map,
  Bot,
  FileText,
  History,
  Settings,
  Building,
  Users
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navSections = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Members of Parliament', path: '/mps', icon: Users }
    ]
  },
  {
    title: 'Monitoring',
    items: [
      { name: 'Projects', path: '/projects', icon: FolderKanban },
      { name: 'Risk Analysis', path: '/risk-analysis', icon: AlertTriangle },
      { name: 'Alerts', path: '/alerts', icon: Bell },
      { name: 'Compliance', path: '/compliance', icon: ShieldCheck }
    ]
  },
  {
    title: 'Analytics',
    items: [
      { name: 'Financial', path: '/financial', icon: TrendingUp },
      { name: 'Project Execution', path: '/project-execution', icon: FolderKanban },
      { name: 'Geographic', path: '/geographic', icon: Map },
      { name: 'Districts', path: '/districts', icon: Building },
      { name: 'Agencies', path: '/agencies', icon: Users },
    ]
  },
  {
    title: 'Intelligence',
    items: [
      { name: 'AI Assistant', path: '/assistant', icon: Bot }
    ]
  },
  {
    title: 'Management',
    items: [
      { name: 'Reports', path: '/reports', icon: FileText },
      { name: 'Audit Trail', path: '/audit', icon: History }
    ]
  }
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full shrink-0">
      <div className="h-16 flex items-center px-6 font-bold text-white tracking-wider border-b border-slate-800">
        MPLADS INTELLIGENCE
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-slate-700">
        {navSections.map((section) => (
          <div key={section.title} className="mb-6">
            <h3 className="px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => cn(
                        'flex items-center px-6 py-2 text-sm font-medium transition-colors',
                        isActive 
                          ? 'text-white bg-blue-600' 
                          : 'hover:text-white hover:bg-slate-800'
                      )}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {item.name}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="mt-auto border-t border-slate-800 p-4">
        <NavLink
          to="/settings"
          className={({ isActive }) => cn(
            'flex items-center px-2 py-2 text-sm font-medium transition-colors rounded-md',
            isActive 
              ? 'text-white bg-blue-600' 
              : 'hover:text-white hover:bg-slate-800'
          )}
        >
          <Settings className="w-4 h-4 mr-3" />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}
