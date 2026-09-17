import { useState, useMemo } from 'react';
import { useAlerts } from '../hooks/useData';
import { AlertTriangle, Clock, CheckCircle, ShieldAlert, ArrowRight, Check } from 'lucide-react';

export function Alerts() {
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('OPEN');
  
  const [resolvedAlerts, setResolvedAlerts] = useState<Set<string>>(new Set());
  const { alerts, loading: alertsLoading } = useAlerts(resolvedAlerts);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a: any) => {
      const matchSev = filterSeverity === 'ALL' || a.severity === filterSeverity;
      const matchStat = filterStatus === 'ALL' || a.status === filterStatus;
      return matchSev && matchStat;
    });
  }, [alerts, filterSeverity, filterStatus]);

  if (alertsLoading) return <div className="p-8 text-slate-500">Loading alerts engine...</div>;

  const totalCritical = alerts.filter((a: any) => a.severity === 'CRITICAL' && a.status === 'OPEN').length;
  const totalHigh = alerts.filter((a: any) => a.severity === 'HIGH' && a.status === 'OPEN').length;

  const handleResolve = (id: string) => {
    setResolvedAlerts(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Risk & Alert Center</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Actionable intelligence generated from deterministic risk signals.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center text-slate-500 mb-2">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
            <span className="font-bold uppercase tracking-wider text-xs">Open Critical</span>
          </div>
          <div className="text-3xl font-bold text-red-700">{totalCritical}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center text-slate-500 mb-2">
            <ShieldAlert className="w-5 h-5 mr-2 text-orange-600" />
            <span className="font-bold uppercase tracking-wider text-xs">Open High</span>
          </div>
          <div className="text-3xl font-bold text-orange-700">{totalHigh}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center text-slate-500 mb-2">
            <Clock className="w-5 h-5 mr-2 text-blue-600" />
            <span className="font-bold uppercase tracking-wider text-xs">Total Open</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{alerts.filter((a: any) => a.status === 'OPEN').length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center text-slate-500 mb-2">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            <span className="font-bold uppercase tracking-wider text-xs">Resolved</span>
          </div>
          <div className="text-3xl font-bold text-green-700">{resolvedAlerts.size}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <select 
              value={filterSeverity} 
              onChange={e => setFilterSeverity(e.target.value)}
              className="border border-slate-300 rounded px-3 py-1.5 text-sm"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MODERATE">Moderate</option>
            </select>
            <select 
              value={filterStatus} 
              onChange={e => setFilterStatus(e.target.value)}
              className="border border-slate-300 rounded px-3 py-1.5 text-sm"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>
        
        <div className="divide-y divide-slate-100">
          {filteredAlerts.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              No alerts match the selected filters.
            </div>
          )}
          {filteredAlerts.map((alert: any) => (
            <div key={alert.id} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                      alert.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-slate-500 font-mono text-xs">{alert.id}</span>
                    <span className={`text-xs font-bold ${alert.status === 'RESOLVED' ? 'text-green-600' : 'text-blue-600'}`}>
                      {alert.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{alert.type} detected in Member Allocation</h3>
                  <div className="text-sm text-slate-500 mt-1">
                    Member: <strong className="text-slate-700">{alert.member?.name || 'Unknown'}</strong> ({alert.member?.house || 'Unknown'}) • State: {alert.member?.state || 'Unknown'}
                  </div>
                </div>
                {alert.status === 'OPEN' && (
                  <button 
                    onClick={() => handleResolve(alert.id)}
                    className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md text-sm font-semibold transition-colors border border-blue-200"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Resolve Alert
                  </button>
                )}
              </div>
              
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Evidence & Recommended Action</h4>
                <div className="text-sm text-slate-700 mb-3 space-y-2">
                  {alert.risk.factors ? alert.risk.factors.map((f: any, i: number) => (
                    <div key={i}>• {f.description} ({f.evidence})</div>
                  )) : alert.risk.signals?.map((s: string, i: number) => (
                    <div key={i}>• {s}</div>
                  ))}
                </div>
                <div className="text-sm font-semibold text-slate-900 flex items-center bg-white p-3 rounded border border-slate-200">
                  <ArrowRight className="w-4 h-4 mr-2 text-slate-400" />
                  {alert.risk.recommendedAction || "Investigate the generated signals and evaluate for compliance."}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
