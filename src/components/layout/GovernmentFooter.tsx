import { Shield, ExternalLink } from 'lucide-react';

export function GovernmentFooter() {
  return (
    <footer className="bg-[#0B2945] text-slate-300 text-xs border-t-4 border-[#123F68] mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-8 border-b border-slate-700/80">
          
          {/* Col 1: Portal Branding */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <img 
                src="/assets/emblem-india.jpg" 
                alt="Emblem of India" 
                className="h-10 w-auto invert filter brightness-200 mix-blend-screen" 
              />
              <div>
                <div className="font-extrabold text-white text-sm">MPLADS PORTAL</div>
                <div className="text-[10px] text-slate-400">Government of India</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              National decision support and monitoring system for Member of Parliament Local Area Development Scheme (MPLADS).
            </p>
          </div>

          {/* Col 2: Government Links */}
          <div>
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3 text-amber-400 border-b border-slate-700 pb-1">
              Official Portals
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <a href="https://www.mospi.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center">
                  <ExternalLink className="w-3 h-3 mr-1 text-slate-400" />
                  MoSPI Official Website
                </a>
              </li>
              <li>
                <a href="https://india.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center">
                  <ExternalLink className="w-3 h-3 mr-1 text-slate-400" />
                  National Portal of India
                </a>
              </li>
              <li>
                <a href="https://sansad.in" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center">
                  <ExternalLink className="w-3 h-3 mr-1 text-slate-400" />
                  Parliament of India (Sansad)
                </a>
              </li>
              <li>
                <a href="https://digitalindia.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center">
                  <ExternalLink className="w-3 h-3 mr-1 text-slate-400" />
                  Digital India Initiative
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Guidelines & Circulars */}
          <div>
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3 text-amber-400 border-b border-slate-700 pb-1">
              Scheme Information
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li className="hover:text-white cursor-pointer">Revised MPLADS Guidelines 2023</li>
              <li className="hover:text-white cursor-pointer">Eligible & Prohibited Sector Works</li>
              <li className="hover:text-white cursor-pointer">District Authority Implementation Manual</li>
              <li className="hover:text-white cursor-pointer">Utilization Certificate Formats</li>
            </ul>
          </div>

          {/* Col 4: Platform Compliance */}
          <div>
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3 text-amber-400 border-b border-slate-700 pb-1">
              Security & Compliance
            </h4>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center text-emerald-400 font-semibold">
                <Shield className="w-3.5 h-3.5 mr-1.5" />
                STQC Certified Platform
              </div>
              <p className="text-slate-400 text-[10px]">
                Hosted on National Informatics Centre (NIC) Cloud Infrastructure. Encrypted TLS 1.3 telemetry.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-4 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 gap-2">
          <div>
            © {new Date().getFullYear()} Ministry of Statistics and Programme Implementation, Government of India. All rights reserved.
          </div>
          <div className="flex items-center space-x-4">
            <span className="hover:text-white cursor-pointer">Website Policies</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Help & Contact</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Feedback</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
