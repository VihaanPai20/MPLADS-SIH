import { useLocation } from 'react-router-dom';
import { useRole } from '../../contexts/RoleContext';
import { ChevronRight, ShieldCheck } from 'lucide-react';

interface BannerMetadata {
  title: string;
  subtitle: string;
  category: string;
}

const pageMetadataMap: Record<string, BannerMetadata> = {
  '/dashboard': {
    category: 'Overview',
    title: 'Member Of Parliament Local Area Development Scheme (MPLADS)',
    subtitle: 'National Monitoring Portal for Sanctioned Works, Fund Flows, and Machine Learning Risk Analytics.'
  },
  '/mps': {
    category: 'Parliament Roster',
    title: 'Members of Parliament (Lok Sabha & Rajya Sabha)',
    subtitle: 'Constituency portfolios, fund allocation, and work recommendation progress.'
  },
  '/projects': {
    category: 'Monitoring',
    title: 'MPLADS Sanctioned Works & Projects Master Registry',
    subtitle: 'Comprehensive tracking of physical execution, financial milestones, and district status.'
  },
  '/risk-analysis': {
    category: 'Intelligence & Analytics',
    title: 'Predictive Machine Learning Risk Engine',
    subtitle: 'Unsupervised Isolation Forest anomaly detection and TF-IDF duplicate portfolio matching.'
  },
  '/alerts': {
    category: 'Monitoring & Escalations',
    title: 'Real-time System Alerts & Compliance Exceptions',
    subtitle: 'High-risk automated alerts for cost escalation, delay risk, and implementation anomalies.'
  },
  '/compliance': {
    category: 'Regulatory Oversight',
    title: 'MPLADS Scheme Guidelines Compliance Framework',
    subtitle: 'Verification of eligible sectors, prohibited works, and audit certificate compliance.'
  },
  '/analytics': {
    category: 'Analytics',
    title: 'Analytics Intelligence Hub',
    subtitle: 'Centralized telemetry access for financial, geographic, and execution diagnostics.'
  },
  '/financial': {
    category: 'Analytics',
    title: 'Financial Allocation & Expenditure Analytics',
    subtitle: 'State-wise fund distribution, unspent balance telemetry, and audit reporting.'
  },
  '/project-execution': {
    category: 'Analytics',
    title: 'Project Completion & Execution Telemetry',
    subtitle: 'Physical progress vs financial progress evaluation and bottleneck diagnosis.'
  },
  '/districts': {
    category: 'Analytics',
    title: 'District Nodal Authority Execution Directory',
    subtitle: 'On-ground implementation status across 700+ administrative districts.'
  },
  '/agencies': {
    category: 'Analytics',
    title: 'Implementing Agencies Performance Register',
    subtitle: 'Execution agency productivity, delayed works, and vendor verification.'
  },
  '/geographic': {
    category: 'Spatial Intelligence',
    title: 'Geographic GIS Mapping & Spatial Analytics',
    subtitle: 'Interactive map of MPLADS works across Indian states and parliamentary constituencies.'
  },
  '/assistant': {
    category: 'Intelligence & Decision Support',
    title: 'AI Investigation & Decision Support Assistant',
    subtitle: 'Conversational natural language audit assistant powered by ML telemetry.'
  },
  '/reports': {
    category: 'Management',
    title: 'Official Ministry & State Progress Reports',
    subtitle: 'Generation of utilization certificates, parliamentary disclosures, and summary sheets.'
  },
  '/audit': {
    category: 'Management & Governance',
    title: 'Platform System Audit Trail & Event Logs',
    subtitle: 'Immutable record of data ingest, ML model execution, and user actions.'
  }
};

export function GovernmentBanner() {
  const location = useLocation();
  const { role } = useRole();

  const meta = pageMetadataMap[location.pathname] || {
    category: 'Official Portal',
    title: 'Member Of Parliament Local Area Development Scheme (MPLADS)',
    subtitle: 'Ministry of Statistics and Programme Implementation - Government of India'
  };

  return (
    <div className="w-full bg-gov-pattern text-white relative overflow-hidden border-b border-[#0B2945]" style={{ backgroundColor: '#123F68' }}>
      {/* Background Subtle Watermark Overlay */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FFFFFF_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          
          {/* Main Title & Breadcrumbs */}
          <div className="max-w-3xl">
            {/* Breadcrumb Trail */}
            <nav className="flex items-center space-x-2 text-xs font-semibold text-amber-400 mb-2">
              <span>Home</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span>{meta.category}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-slate-200 underline decoration-amber-400 underline-offset-4">{meta.title.split(' ')[0]} View</span>
            </nav>

            {/* Page Main Title */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white font-display tracking-tight leading-snug">
              {meta.title}
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-slate-200 mt-2 font-normal max-w-2xl leading-relaxed">
              {meta.subtitle}
            </p>

            {/* Authority Role Indicator */}
            <div className="mt-4 flex items-center space-x-2">
              <span className="bg-[#0B2945] text-amber-400 text-[11px] font-bold px-3 py-1 rounded border border-amber-500/30 shadow-sm flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                ACTIVE AUTHORITY: {role.toUpperCase()}
              </span>
              <span className="text-xs text-slate-300">
                MoSPI Data Integration Active • Live Telemetry
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
