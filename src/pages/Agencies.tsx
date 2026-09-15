import { Database, AlertCircle, Building2 } from 'lucide-react';

export function Agencies() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Implementing Entity Intelligence</h1>
          <p className="text-slate-500 mt-1 text-sm max-w-2xl">
            Monitor project execution, financial performance, and predictive risk across implementing entities and authorities.
          </p>
        </div>
        
        {/* DATA COVERAGE CARD */}
        <div className="bg-slate-900 text-slate-300 rounded-lg p-3 text-xs shadow-md border border-slate-700 w-full md:w-64">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-2">
            <span className="font-bold tracking-wider text-slate-400">DATA COVERAGE</span>
            <Database className="w-3 h-3 text-red-400" />
          </div>
          <div className="flex justify-between">
            <span>Implementing Agency</span>
            <span className="text-red-400 font-bold">0%</span>
          </div>
          <div className="flex justify-between">
            <span>Implementing Authority</span>
            <span className="text-red-400 font-bold">0%</span>
          </div>
          <div className="flex justify-between">
            <span>Department</span>
            <span className="text-red-400 font-bold">0%</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 border-dashed rounded-lg shadow-sm flex flex-col items-center justify-center p-12 text-center mt-8">
        <Building2 className="w-16 h-16 text-slate-300 mb-4" />
        <h3 className="text-xl font-bold text-slate-700 mb-3">Insufficient Source Data</h3>
        <p className="text-sm text-slate-500 max-w-2xl mb-6">
          The underlying normalized dataset (Lok Sabha / Rajya Sabha allocations) <strong>genuinely does not contain any fields</strong> tracking the Implementing Agency, Executing Authority, or Department assigned to execute the portfolios.
        </p>
        <div className="bg-amber-50 border border-amber-200 p-4 rounded text-amber-800 text-sm max-w-3xl flex items-start text-left">
          <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
          <div>
            <strong className="block mb-1">Architectural Integrity Guard:</strong>
            In accordance with strict system rules, we do not fabricate fake entity names, mock agency metrics, or disconnected frontend ML predictions to make this UI appear full. Entity-level machine learning and predictive intelligence (Execution Risk, Delay Probability) are suspended until an authoritative Agency mapping sub-dataset is provided.
          </div>
        </div>
      </div>
    </div>
  );
}
