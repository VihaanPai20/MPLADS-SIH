import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ShieldAlert, Cpu, CheckCircle, ChevronRight, ChevronLeft, LogIn } from 'lucide-react';

export function Landing() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hero slider images
  const slides = [
    {
      image: "https://images.unsplash.com/photo-1541888087401-218204b4c730?auto=format&fit=crop&q=80",
      title: "EARLY WARNING INTELLIGENCE",
      subtitle: "Predictive Trajectory Analytics & Non-Linear Risk Detection for Infrastructure Projects"
    },
    {
      image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80",
      title: "NATIONAL MPLADS MONITORING",
      subtitle: "Ensuring Compliance and Execution Integrity across all State Nodal Authorities"
    },
    {
      image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80",
      title: "AI-DRIVEN ANOMALY DETECTION",
      subtitle: "Automated Identification of Cost Outliers and Structural Duplicates"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Official Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mock Emblem/Logo placeholder */}
            <div className="w-12 h-16 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg")' }} />
            <div>
              <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight leading-tight uppercase">
                Government of India <br className="md:hidden" />
                <span className="text-[#1e3a8a]">Ministry of Statistics and Programme Implementation</span>
              </h1>
              <p className="text-xs text-slate-500 hidden md:block">Infrastructure & Project Monitoring Division (IPMD)</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 bg-[#1e3a8a] hover:bg-[#1e40af] text-white px-5 py-2.5 rounded text-sm font-semibold transition-colors shadow-md"
          >
            <LogIn className="w-4 h-4" />
            Sign In / Portal
          </button>
        </div>
        {/* Navigation Ribbon */}
        <div className="bg-[#0f172a] text-slate-300 text-xs py-2 px-8 flex gap-6 overflow-x-auto whitespace-nowrap">
          <button onClick={() => navigate('/dashboard')} className="hover:text-white font-medium flex items-center gap-1"><Building2 className="w-3 h-3"/> Overview</button>
          <button onClick={() => navigate('/dashboard/risk-analysis')} className="hover:text-white font-medium flex items-center gap-1"><Cpu className="w-3 h-3"/> ML Analytics</button>
          <button onClick={() => navigate('/dashboard/alerts')} className="hover:text-white font-medium flex items-center gap-1"><ShieldAlert className="w-3 h-3"/> Early Warning Center <span className="bg-orange-500 text-white px-1.5 rounded-full text-[10px]">Active</span></button>
          <button onClick={() => navigate('/dashboard/compliance')} className="hover:text-white font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Compliance</button>
        </div>
      </header>

      <main className="flex-grow">
        
        {/* Hero Slider Section */}
        <section className="relative h-[500px] w-full overflow-hidden bg-slate-900">
          {slides.map((slide, index) => (
            <div 
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent" />
              
              <div className="relative h-full max-w-7xl mx-auto px-8 flex flex-col justify-center text-white">
                <h2 className="text-4xl md:text-5xl font-black tracking-wider text-[#38bdf8] mb-4 drop-shadow-lg uppercase">
                  {slide.title}
                </h2>
                <p className="text-xl md:text-2xl font-medium max-w-2xl text-slate-200">
                  {slide.subtitle}
                </p>
              </div>
            </div>
          ))}
          
          <button 
            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition backdrop-blur-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition backdrop-blur-sm"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, index) => (
              <button 
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? 'bg-white w-6' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </section>

        {/* Dark Blue Statistics Banner (Hardcoded generic high-level dataset stats) */}
        <section className="bg-gradient-to-b from-[#0f172a] to-[#1e3a8a] py-16 text-white text-center border-b-4 border-[#38bdf8]">
          <h2 className="text-3xl font-bold mb-2">National Statistics Office, India</h2>
          <p className="text-slate-300 mb-12">Shaping India's Infrastructure Future with Data-Driven Decision Making</p>
          
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold text-[#facc15] mb-2">543</span>
              <span className="text-sm font-medium text-slate-300">Lok Sabha Constituencies</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold text-[#facc15] mb-2">28</span>
              <span className="text-sm font-medium text-slate-300">State Nodal Authorities</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold text-[#facc15] mb-2">₹39,500 Cr</span>
              <span className="text-sm font-medium text-slate-300">Lifetime Funds Disbursed</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold text-[#facc15] mb-2">94%</span>
              <span className="text-sm font-medium text-slate-300">Digital Audit Compliance</span>
            </div>
          </div>
        </section>

        {/* Flipping Cards Section - Themes */}
        <section className="py-20 px-4 bg-slate-100">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 mb-10">
              <Building2 className="w-6 h-6 text-slate-600" />
              <h3 className="text-2xl font-bold text-slate-800">Platform Modules & Analytics</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 perspective-1000">
              
              {/* Card 1 */}
              <div className="group h-80 cursor-pointer [perspective:1000px]">
                <div className="relative w-full h-full text-center transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] shadow-lg rounded-xl">
                  {/* Front */}
                  <div className="absolute w-full h-full bg-white rounded-xl flex flex-col items-center justify-center p-6 border border-slate-200 [backface-visibility:hidden]">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                      <Cpu className="w-8 h-8 text-blue-600" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 mb-2">Machine Learning Risk Engine</h4>
                    <p className="text-sm text-slate-500">Predictive analysis using Isolation Forests to detect financial anomalies.</p>
                  </div>
                  {/* Back */}
                  <div className="absolute w-full h-full bg-[#1e3a8a] text-white rounded-xl flex flex-col items-center justify-center p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <h4 className="text-lg font-bold mb-4 border-b border-blue-400 pb-2">Technical Details</h4>
                    <ul className="text-sm text-left space-y-2">
                      <li>• Unsupervised Isolation Forest</li>
                      <li>• Z-Score Cost Variations</li>
                      <li>• Real-time Predictive Scoring</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="group h-80 cursor-pointer [perspective:1000px]">
                <div className="relative w-full h-full text-center transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] shadow-lg rounded-xl">
                  {/* Front */}
                  <div className="absolute w-full h-full bg-white rounded-xl flex flex-col items-center justify-center p-6 border border-slate-200 [backface-visibility:hidden]">
                    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                      <ShieldAlert className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 mb-2">NLP Duplicate Detection</h4>
                    <p className="text-sm text-slate-500">TF-IDF & Cosine Similarity mapping to prevent overlapping infrastructure proposals.</p>
                  </div>
                  {/* Back */}
                  <div className="absolute w-full h-full bg-indigo-700 text-white rounded-xl flex flex-col items-center justify-center p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <h4 className="text-lg font-bold mb-4 border-b border-indigo-400 pb-2">Technical Details</h4>
                    <ul className="text-sm text-left space-y-2">
                      <li>• TF-IDF Vectorization</li>
                      <li>• N-Gram Context Matching</li>
                      <li>• Cosine Similarity Matrix</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="group h-80 cursor-pointer [perspective:1000px]">
                <div className="relative w-full h-full text-center transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] shadow-lg rounded-xl">
                  {/* Front */}
                  <div className="absolute w-full h-full bg-white rounded-xl flex flex-col items-center justify-center p-6 border border-slate-200 [backface-visibility:hidden]">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 mb-2">Role-Based Access (RBAC)</h4>
                    <p className="text-sm text-slate-500">Hierarchical data views for Ministries, State Nodal Authorities, and District Collectors.</p>
                  </div>
                  {/* Back */}
                  <div className="absolute w-full h-full bg-emerald-700 text-white rounded-xl flex flex-col items-center justify-center p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <h4 className="text-lg font-bold mb-4 border-b border-emerald-400 pb-2">Governance Flow</h4>
                    <ul className="text-sm text-left space-y-2">
                      <li>• JWT-Secured Routes</li>
                      <li>• Dynamic Data Scoping</li>
                      <li>• Auditable Actions</li>
                    </ul>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </section>

      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center">
        <p className="text-xs text-slate-500 font-medium">
          © {new Date().getFullYear()} Government of India. Ministry of Statistics and Programme Implementation.
        </p>
      </footer>
    </div>
  );
}
