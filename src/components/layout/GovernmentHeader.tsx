import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  Menu, 
  X, 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  Map, 
  Building, 
  Bot, 
  FileText, 
  History,
  Eye,
  Globe
} from 'lucide-react';
import { useHouse, type GlobalHouseSelection } from '../../contexts/HouseContext';
import { useRole, type RoleSelection } from '../../contexts/RoleContext';
import { useMembers, useMLData } from '../../hooks/useData';
import { hasAccess } from '../../auth/permissions';

const roles = [
  'Ministry',
  'State Nodal Authority',
  'District Authority',
  'Member of Parliament',
  'Administrator'
];

export function GovernmentHeader() {
  const { house, setHouse } = useHouse();
  const { role, setRole } = useRole();
  const { members } = useMembers();
  const { mlRisk } = useMLData();
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAnalyticsDropdownOpen, setIsAnalyticsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLangHindi, setIsLangHindi] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const analyticsDropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (analyticsDropdownRef.current && !analyticsDropdownRef.current.contains(event.target as Node)) {
        setIsAnalyticsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
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
    setIsSearchFocused(false);
    navigate('/dashboard/mps');
  };

  const activeAlerts = mlRisk ? mlRisk.filter(r => r.risk_level === 'CRITICAL').slice(0, 5) : [];

  const isAnalyticsActive = ['/dashboard/financial', '/dashboard/project-execution', '/dashboard/geographic', '/dashboard/districts', '/dashboard/agencies'].includes(location.pathname);

  const can = (route: string) => hasAccess(role, route as any);
  const showAnalytics = can('analytics') || can('financial') || can('project-execution') || can('districts') || can('agencies') || can('geographic');

  return (
    <header className="w-full bg-white border-b border-brandBorder shadow-sm sticky top-0 z-50">
      {/* 1. Top Accessibility & GoI Utility Bar */}
      <div className="bg-forest-deep text-white/80 text-xs py-1 px-4 sm:px-8 flex justify-between items-center border-b border-forest-deep">
        <div className="flex items-center space-x-3">
          <span className="font-semibold text-white tracking-wider uppercase text-[11px] flex items-center">
            <span className="w-2 h-2 rounded-full bg-palegreen inline-block mr-1.5 animate-pulse"></span>
            GOVERNMENT OF INDIA PORTAL
          </span>
          <span className="text-white">|</span>
          <span className="hidden md:inline text-white">Ministry of Statistics and Programme Implementation (MoSPI)</span>
        </div>
        <div className="flex items-center space-x-4 text-[11px]">
          <button 
            onClick={() => setIsLangHindi(!isLangHindi)}
            className="hover:text-white flex items-center font-semibold bg-forest-deep px-2.5 py-0.5 rounded border border-forest-primary transition-colors"
            title="Toggle Language"
          >
            <Globe className="w-3 h-3 mr-1 text-amber-400" />
            {isLangHindi ? 'English' : 'हिंदी'} (A/अ)
          </button>
          <button className="hover:text-white hidden sm:flex items-center" title="Screen Reader Access">
            <Eye className="w-3 h-3 mr-1" />
            Accessibility
          </button>
        </div>
      </div>

      {/* 2. Main Branding Header Bar */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 bg-white">
        
        {/* Left Branding Group */}
        <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
          <img 
            src="/assets/emblem-india.jpg" 
            alt="State Emblem of India" 
            className="h-14 sm:h-16 w-auto object-contain shrink-0 mix-blend-multiply cursor-pointer" 
            onClick={() => navigate('/dashboard')}
          />
          <div className="flex flex-col cursor-pointer pr-3" onClick={() => navigate('/dashboard')}>
            <span className="text-sm sm:text-base font-bold text-charcoal tracking-tight leading-snug font-display">
              {isLangHindi ? 'भारत सरकार' : 'Government Of India'}
            </span>
            <span className="text-sm sm:text-base font-bold text-charcoal leading-snug font-display">
              {isLangHindi ? 'सांख्यिकी और कार्यक्रम कार्यान्वयन मंत्रालय' : 'Ministry of Statistics and'}
            </span>
            <span className="text-sm sm:text-base font-bold text-charcoal leading-snug font-display">
              {isLangHindi ? '' : 'Programme Implementation'}
            </span>
          </div>

          {/* Campaign Logos with Vertical Dividers matching exact user reference image */}
          <div className="hidden xl:flex items-center space-x-4 pl-4 border-l border-brandBorder shrink-0">
            <img 
              src="/assets/data-for-development.jpg" 
              alt="Data for Development" 
              className="h-12 w-auto object-contain shrink-0 mix-blend-multiply" 
            />
            <div className="h-10 border-r border-brandBorder"></div>
            <img 
              src="/assets/swachh-bharat.jpg" 
              alt="Swachh Bharat" 
              className="h-10 w-auto object-contain shrink-0 mix-blend-multiply" 
            />
            <div className="h-10 border-r border-brandBorder"></div>
            <img 
              src="/assets/stay-safe-online.jpg" 
              alt="Stay Safe Online" 
              className="h-10 w-auto object-contain shrink-0 mix-blend-multiply" 
            />
            <div className="h-10 border-r border-brandBorder"></div>
          </div>
        </div>

        {/* Right Utility Controls */}
        <div className="flex items-center space-x-3 shrink-0">
          
          {/* Global Search Bar */}
          <div className="relative hidden md:block w-48 lg:w-60 xl:w-64" ref={searchRef}>
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-mutedText" />
            </span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full pl-9 pr-3 py-1.5 border border-brandBorder rounded bg-white text-xs text-charcoal font-medium focus:outline-none focus:ring-2 focus:ring-forest-primary focus:bg-white transition-all shadow-inner"
              placeholder="Search member, state, constituency..."
            />
            {isSearchFocused && search.length > 2 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded shadow-xl border border-brandBorder text-charcoal max-h-80 overflow-y-auto z-50">
                {searchResults.length === 0 ? (
                  <div className="p-3 text-xs text-mutedText text-center">No matching records found.</div>
                ) : (
                  <div className="py-1">
                    {searchResults.map(result => (
                      <div 
                        key={result.id} 
                        onClick={() => handleSelectResult(result.id)}
                        className="px-3 py-2 hover:bg-palegreen cursor-pointer border-b border-brandBorder last:border-0"
                      >
                        <div className="font-bold text-xs text-forest-deep">{result.name}</div>
                        <div className="text-[10px] text-mutedText flex gap-2 mt-0.5">
                          <span className="bg-forest-deep text-white px-1 py-0.2 rounded text-[9px] uppercase font-bold">{result.house}</span>
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

          {/* House Selector */}
          <div className="hidden lg:flex items-center space-x-1.5 bg-white px-2.5 py-1 rounded border border-brandBorder shrink-0">
            <span className="text-[10px] font-bold text-mutedText uppercase tracking-wider">House:</span>
            <select 
              className="text-xs bg-transparent font-bold text-forest-deep focus:outline-none cursor-pointer"
              value={house}
              onChange={(e) => setHouse(e.target.value as GlobalHouseSelection)}
            >
              <option value="ALL">All Parliament</option>
              <option value="LOK_SABHA">Lok Sabha</option>
              <option value="RAJYA_SABHA">Rajya Sabha</option>
            </select>
          </div>

          {/* Role Selector */}
          <div className="hidden sm:flex items-center space-x-1.5 bg-palegreen px-2.5 py-1 rounded border border-brandBorder shrink-0">
            <span className="text-[10px] font-bold text-forest-deep uppercase tracking-wider">Authority:</span>
            <select 
              className="text-xs bg-transparent font-extrabold text-forest-deep focus:outline-none cursor-pointer"
              value={role}
              onChange={(e) => setRole(e.target.value as RoleSelection)}
            >
              {roles.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Notifications Bell */}
          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 text-forest-deep hover:bg-palegreen rounded transition-colors shrink-0" 
              title="System Alerts"
            >
              <Bell className="w-5 h-5" />
              {activeAlerts.length > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white shadow">
                  {activeAlerts.length}
                </span>
              )}
            </button>
            
            {isNotificationsOpen && (
              <div className="absolute top-full right-0 mt-1 w-80 bg-white rounded-md shadow-xl border border-brandBorder z-50 overflow-hidden">
                <div className="bg-forest-deep text-white px-4 py-2 font-bold text-xs flex justify-between items-center">
                  <span>System Alerts</span>
                  <span className="bg-risk-critical text-white px-2 py-0.5 rounded-full text-[9px]">{activeAlerts.length} New</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {activeAlerts.length === 0 ? (
                    <div className="p-4 text-center text-xs text-mutedText">No critical alerts at this time.</div>
                  ) : (
                    activeAlerts.map((alert: any, idx) => {
                      const member = members.find(m => m.id === alert.member_id);
                      return (
                        <div key={idx} className="p-3 border-b border-brandBorder hover:bg-white cursor-pointer" onClick={() => { setIsNotificationsOpen(false); navigate('/dashboard/alerts'); }}>
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <div>
                              <div className="text-xs font-bold text-charcoal leading-tight">Critical Risk: {member?.name || alert.member_id}</div>
                              <div className="text-[10px] text-mutedText mt-1">{alert.primary_signal}</div>
                              <div className="text-[9px] text-red-600 font-bold mt-1">Score: {alert.overall_risk_score.toFixed(1)}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div 
                  className="bg-white text-center py-2 text-xs font-bold text-forest-primary hover:bg-palegreen cursor-pointer border-t border-brandBorder"
                  onClick={() => { setIsNotificationsOpen(false); navigate('/dashboard/alerts'); }}
                >
                  View All Alerts in Hub
                </div>
              </div>
            )}
          </div>

          {/* User Badge */}
          <div className="flex items-center space-x-2 pl-2 border-l border-brandBorder shrink-0">
            <div className="w-8 h-8 rounded bg-forest-deep text-white flex items-center justify-center font-bold text-xs border border-forest-primary shadow-xs">
              GOI
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-forest-deep leading-none">Authority User</span>
              <span className="text-[10px] text-mutedText font-semibold leading-tight mt-0.5">{role}</span>
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  navigate('/login');
                }}
                className="text-[9px] text-red-500 font-bold hover:underline text-left mt-0.5"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-forest-deep hover:bg-palegreen rounded shrink-0"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 3. Main Government Navigation Bar */}
      <nav className="bg-forest-deep text-white shadow-md">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="hidden lg:flex items-center justify-start space-x-1 text-xs font-semibold overflow-x-auto">
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => `flex items-center px-3.5 py-2.5 transition-colors border-b-4 ${isActive ? 'bg-forest-deep border-brandBorder font-bold text-white' : 'border-transparent hover:bg-forest-deep text-white/70 hover:text-white'}`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              Dashboard
            </NavLink>

            {can('mps') && <NavLink 
              to="/dashboard/mps" 
              className={({ isActive }) => `flex items-center px-3.5 py-2.5 transition-colors border-b-4 ${isActive ? 'bg-forest-deep border-brandBorder font-bold text-white' : 'border-transparent hover:bg-forest-deep text-white/70 hover:text-white'}`}
            >
              <Users className="w-3.5 h-3.5 mr-1.5 text-white/70" />
              MPs
            </NavLink>}

            {can('projects') && <NavLink 
              to="/dashboard/projects" 
              className={({ isActive }) => `flex items-center px-3.5 py-2.5 transition-colors border-b-4 ${isActive ? 'bg-forest-deep border-brandBorder font-bold text-white' : 'border-transparent hover:bg-forest-deep text-white/70 hover:text-white'}`}
            >
              <FolderKanban className="w-3.5 h-3.5 mr-1.5 text-white/70" />
              Works & Projects
            </NavLink>}

            {can('risk-analysis') && <NavLink 
              to="/dashboard/risk-analysis" 
              className={({ isActive }) => `flex items-center px-3.5 py-2.5 transition-colors border-b-4 ${isActive ? 'bg-forest-deep border-brandBorder font-bold text-white' : 'border-transparent hover:bg-forest-deep text-white/70 hover:text-white'}`}
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              Risk & ML Analysis
            </NavLink>}

            {can('alerts') && <NavLink 
              to="/dashboard/alerts" 
              className={({ isActive }) => `flex items-center px-3.5 py-2.5 transition-colors border-b-4 ${isActive ? 'bg-forest-deep border-brandBorder font-bold text-white' : 'border-transparent hover:bg-forest-deep text-white/70 hover:text-white'}`}
            >
              <Bell className="w-3.5 h-3.5 mr-1.5 text-red-400" />
              Alerts
            </NavLink>}

            {can('compliance') && <NavLink 
              to="/dashboard/compliance" 
              className={({ isActive }) => `flex items-center px-3.5 py-2.5 transition-colors border-b-4 ${isActive ? 'bg-forest-deep border-brandBorder font-bold text-white' : 'border-transparent hover:bg-forest-deep text-white/70 hover:text-white'}`}
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-forest-secondary" />
              Compliance
            </NavLink>}

            {/* Analytics Dropdown - only show if role can access any analytics sub-page */}
            {showAnalytics && <div className="relative" ref={analyticsDropdownRef} onMouseEnter={() => setIsAnalyticsDropdownOpen(true)} onMouseLeave={() => setIsAnalyticsDropdownOpen(false)}>
              <NavLink
                to="/dashboard/analytics"
                className={({ isActive }) => `flex items-center px-3.5 py-2.5 transition-colors border-b-4 ${isActive || isAnalyticsActive ? 'bg-forest-deep border-brandBorder font-bold text-white' : 'border-transparent hover:bg-forest-deep text-white/70 hover:text-white'}`}
              >
                <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-sky-300" />
                Analytics
                <ChevronDown className="w-3 h-3 ml-1" />
              </NavLink>
              {isAnalyticsDropdownOpen && (
                <div className="absolute top-full left-0 w-48 bg-forest-deep border border-forest-deep shadow-xl rounded-b py-1 z-50 text-xs">
                  {can('financial') && <NavLink 
                    to="/dashboard/financial" 
                    onClick={() => setIsAnalyticsDropdownOpen(false)}
                    className="block px-4 py-2 hover:bg-forest-deep text-white/70 hover:text-white"
                  >
                    Financial Analytics
                  </NavLink>}
                  {can('project-execution') && <NavLink 
                    to="/dashboard/project-execution" 
                    onClick={() => setIsAnalyticsDropdownOpen(false)}
                    className="block px-4 py-2 hover:bg-forest-deep text-white/70 hover:text-white"
                  >
                    Project Execution
                  </NavLink>}
                  {can('geographic') && <NavLink 
                    to="/dashboard/geographic" 
                    onClick={() => setIsAnalyticsDropdownOpen(false)}
                    className="block px-4 py-2 hover:bg-forest-deep text-mutedText hover:text-white flex items-center"
                  >
                    <Map className="w-3 h-3 mr-1.5 text-forest-secondary" />
                    Geographic Map
                  </NavLink>}
                  {can('districts') && <NavLink 
                    to="/dashboard/districts" 
                    onClick={() => setIsAnalyticsDropdownOpen(false)}
                    className="block px-4 py-2 hover:bg-forest-deep text-mutedText hover:text-white flex items-center"
                  >
                    <Building className="w-3 h-3 mr-1.5 text-amber-400" />
                    Districts View
                  </NavLink>}
                  {can('agencies') && <NavLink 
                    to="/dashboard/agencies" 
                    onClick={() => setIsAnalyticsDropdownOpen(false)}
                    className="block px-4 py-2 hover:bg-forest-deep text-white/70 hover:text-white"
                  >
                    Implementing Agencies
                  </NavLink>}
                </div>
              )}
            </div>}

            {can('assistant') && <NavLink 
              to="/dashboard/assistant" 
              className={({ isActive }) => `flex items-center px-3.5 py-2.5 transition-colors border-b-4 ${isActive ? 'bg-forest-deep border-brandBorder font-bold text-white' : 'border-transparent hover:bg-forest-deep text-white/70 hover:text-white'}`}
            >
              <Bot className="w-3.5 h-3.5 mr-1.5 text-amber-300 animate-pulse" />
              AI Investigation Assistant
            </NavLink>}

            {can('reports') && <NavLink 
              to="/dashboard/reports" 
              className={({ isActive }) => `flex items-center px-3.5 py-2.5 transition-colors border-b-4 ${isActive ? 'bg-forest-deep border-brandBorder font-bold text-white' : 'border-transparent hover:bg-forest-deep text-white/70 hover:text-white'}`}
            >
              <FileText className="w-3.5 h-3.5 mr-1.5 text-white/70" />
              Reports
            </NavLink>}

            {can('audit') && <NavLink 
              to="/dashboard/audit" 
              className={({ isActive }) => `flex items-center px-3.5 py-2.5 transition-colors border-b-4 ${isActive ? 'bg-forest-deep border-brandBorder font-bold text-white' : 'border-transparent hover:bg-forest-deep text-white/70 hover:text-white'}`}
            >
              <History className="w-3.5 h-3.5 mr-1.5 text-white/70" />
              Audit Trail
            </NavLink>}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-forest-deep px-4 pt-2 pb-4 space-y-1 text-sm border-t border-forest-deep">
            <div className="p-2 bg-forest-deep rounded mb-2 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase">Role: {role}</span>
              <select 
                className="text-xs bg-forest-deep text-white p-1 rounded border border-forest-primary"
                value={role}
                onChange={(e) => setRole(e.target.value as RoleSelection)}
              >
                {roles.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <NavLink to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded hover:bg-forest-deep text-white">Dashboard</NavLink>
            {can('mps') && <NavLink to="/dashboard/mps" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded hover:bg-forest-deep text-white">Members of Parliament</NavLink>}
            {can('projects') && <NavLink to="/dashboard/projects" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded hover:bg-forest-deep text-white">Works & Projects</NavLink>}
            {can('risk-analysis') && <NavLink to="/dashboard/risk-analysis" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded hover:bg-forest-deep text-white">Risk & ML Analysis</NavLink>}
            {can('alerts') && <NavLink to="/dashboard/alerts" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded hover:bg-forest-deep text-white">Alerts & Escalations</NavLink>}
            {can('compliance') && <NavLink to="/dashboard/compliance" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded hover:bg-forest-deep text-white">Compliance</NavLink>}
            {can('financial') && <NavLink to="/dashboard/financial" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded hover:bg-forest-deep text-white pl-6">Financial Analytics</NavLink>}
            {can('geographic') && <NavLink to="/dashboard/geographic" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded hover:bg-forest-deep text-white pl-6">Geographic Map</NavLink>}
            {can('assistant') && <NavLink to="/dashboard/assistant" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded hover:bg-forest-deep text-white">AI Assistant</NavLink>}
            {can('reports') && <NavLink to="/dashboard/reports" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded hover:bg-forest-deep text-white">Reports</NavLink>}
            {can('audit') && <NavLink to="/dashboard/audit" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded hover:bg-forest-deep text-white">Audit Trail</NavLink>}
          </div>
        )}
      </nav>
    </header>
  );
}
