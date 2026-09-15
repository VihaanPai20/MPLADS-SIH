import { useNavigate } from 'react-router-dom';
import { TrendingUp, FolderKanban, Map, Building, Users, ArrowRight } from 'lucide-react';

export function AnalyticsHub() {
  const navigate = useNavigate();

  const analyticsModules = [
    {
      title: 'Financial Analytics',
      path: '/financial',
      icon: TrendingUp,
      description: 'State-wise fund distribution, unspent balance telemetry, and utilization tracking.',
      color: 'text-sky-600',
      bg: 'bg-sky-50',
      border: 'border-sky-200'
    },
    {
      title: 'Project Execution',
      path: '/project-execution',
      icon: FolderKanban,
      description: 'Physical vs financial progress evaluation and bottleneck diagnosis across regions.',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200'
    },
    {
      title: 'Geographic Map',
      path: '/geographic',
      icon: Map,
      description: 'Interactive spatial analytics of MPLADS works across Indian states and constituencies.',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200'
    },
    {
      title: 'District Intelligence',
      path: '/districts',
      icon: Building,
      description: 'On-ground implementation status and ML risk aggregation across constituencies.',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200'
    },
    {
      title: 'Implementing Agencies',
      path: '/agencies',
      icon: Users,
      description: 'State Nodal Authority performance register, productivity, and risk metrics.',
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-200'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics Intelligence Hub</h1>
        <p className="text-slate-500 mt-1 text-sm max-w-2xl">
          Centralized access to specialized operational, financial, and geographic telemetry models.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analyticsModules.map((mod, i) => {
          const Icon = mod.icon;
          return (
            <div 
              key={i}
              onClick={() => navigate(mod.path)}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 cursor-pointer hover:shadow-md transition-all hover:border-slate-300 group flex flex-col h-full"
            >
              <div className={`w-12 h-12 rounded-lg ${mod.bg} ${mod.border} border flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${mod.color}`} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
                {mod.title}
              </h3>
              <p className="text-sm text-slate-600 mb-6 flex-1">
                {mod.description}
              </p>
              <div className="flex items-center text-sm font-semibold text-blue-600 group-hover:text-blue-800">
                Launch Module <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
