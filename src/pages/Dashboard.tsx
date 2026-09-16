import { ShieldAlert, IndianRupee, Activity, Clock, Briefcase, FileWarning, AlertTriangle, CheckCircle2, UserCog, Landmark, Building2, MapPin, User } from 'lucide-react';
import { useDashboardStats, useDataQuality } from '../hooks/useData';
import { useRole } from '../contexts/RoleContext';

function formatCurrency(amount: number) {
  return `₹${(amount / 10000000).toFixed(2)} Cr`;
}

export function Dashboard() {
  const { stats, loading, error } = useDashboardStats();
  const quality = useDataQuality();
  const { role } = useRole();

  if (loading) return <div className="p-8 text-slate-500">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-red-500">Error loading dashboard: {error.message}</div>;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {role === 'Administrator' && <UserCog className="w-5 h-5 text-purple-600" />}
            {role === 'Ministry' && <Landmark className="w-5 h-5 text-blue-600" />}
            {role === 'State Nodal Authority' && <Building2 className="w-5 h-5 text-teal-600" />}
            {role === 'District Authority' && <MapPin className="w-5 h-5 text-orange-600" />}
            {role === 'Member of Parliament' && <User className="w-5 h-5 text-indigo-600" />}
            <span className="text-sm font-bold uppercase tracking-wider text-slate-500">{role} View</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">National MPLADS Overview</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {role === 'Administrator' && 'System health, data quality, and platform telemetry.'}
            {role === 'Ministry' && 'National monitoring of works, expenditure, compliance and ML risk anomalies.'}
            {role === 'State Nodal Authority' && 'State-level aggregation, fund flows, and district coordination.'}
            {role === 'District Authority' && 'On-ground execution, physical progress, and utilization certificates.'}
            {role === 'Member of Parliament' && 'Constituency portfolio execution, recommendation limits, and impact.'}
          </p>
        </div>

        {(role === 'Administrator' || role === 'Ministry') && quality && (
          <div className="bg-slate-900 text-slate-300 rounded-lg p-4 text-xs shadow-md border border-slate-700 w-full sm:w-64 flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <span className="font-bold tracking-wider text-slate-400">DATA QUALITY</span>
              <span className="text-emerald-400 font-bold flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {quality.qualityScore.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Records analyzed:</span>
              <span className="text-white font-medium">{quality.records.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Missing critical fields:</span>
              <span className="text-white font-medium">{quality.missingFields.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Potential duplicates:</span>
              <span className="text-white font-medium">{quality.potentialDuplicates.toFixed(1)}%</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI Cards */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center text-slate-500 mb-2">
            <Briefcase className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium uppercase tracking-wider">Total Members</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.totalWorks.toLocaleString()}</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center text-slate-500 mb-2">
            <IndianRupee className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium uppercase tracking-wider">Total Sanctioned</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{formatCurrency(stats.totalSanctioned)}</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm relative group">
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-sm uppercase">Estimated</div>
          <div className="flex items-center text-slate-500 mb-2">
            <Activity className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium uppercase tracking-wider">Total Expenditure</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{formatCurrency(stats.totalSanctioned * 0.72)}</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-red-200 bg-red-50 shadow-sm relative group">
          <div className="flex items-center text-red-700 mb-2">
            <ShieldAlert className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium uppercase tracking-wider">High-Risk Members</span>
          </div>
          <div className="text-3xl font-bold text-red-700">{stats.highRiskWorks}</div>
          <div className="text-sm text-red-600 font-medium mt-1">Requires attention</div>
        </div>

        <div className="bg-orange-50 p-6 rounded-lg border border-orange-200 shadow-sm relative group">
          <div className="absolute top-2 right-2 flex items-center gap-1 text-orange-600 text-[10px] font-bold rounded-sm uppercase bg-orange-100 px-1.5 py-0.5">Predictive</div>
          <div className="flex items-center text-orange-700 mb-2">
            <Clock className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium uppercase tracking-wider">Delay Risk Portfolios</span>
          </div>
          <div className="text-3xl font-bold text-orange-900">{Math.floor(stats.highRiskWorks * 1.5)}</div>
          <div className="text-sm text-orange-600 font-medium mt-1">Estimated prototype</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm relative group">
          <div className="flex items-center text-slate-500 mb-2">
            <FileWarning className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium uppercase tracking-wider">Compliance Exceptions</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.complianceExceptions}</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm relative group">
          <div className="flex items-center text-slate-500 mb-2">
            <AlertTriangle className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium uppercase tracking-wider">Potential Duplicates</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.potentialDuplicates}</div>
        </div>
      </div>
    </div>
  );
}
