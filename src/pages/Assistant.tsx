import { useState, useRef, useEffect, useMemo } from 'react';
import { useMembers, useMLData } from '../hooks/useData';
import { Bot, User, Send, AlertCircle, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function Assistant() {
  const { members } = useMembers();
  const { mlRisk } = useMLData();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello. I am the MPLADS Intelligence Assistant. I am securely connected to your live ML execution engine and normalized datasets.\n\nYou can ask me about:\n• High-risk portfolios and anomalies\n• Constituency-level predictive risk\n• State Nodal Authority risk\n• Duplicate detection results\n• General allocation analytics' }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Pre-calculate aggregates for faster AI responses
  const analytics = useMemo(() => {
    if (!members || !mlRisk) return null;
    
    // Member level risk
    const highRiskMembers = mlRisk.filter(r => r.risk_level === 'HIGH' || r.risk_level === 'CRITICAL');
    const duplicates = mlRisk.filter(r => r.is_duplicate);
    const anomalies = mlRisk.filter(r => r.is_anomaly);
    
    // Constituency Aggregations (Lok Sabha)
    const constituencyMap = new Map<string, number[]>();
    // Authority Aggregations (State)
    const authorityMap = new Map<string, number[]>();
    
    members.forEach(m => {
      const risk = mlRisk.find(r => r.member_id === m.id)?.overall_risk_score;
      if (risk !== undefined) {
        if (m.house === 'Lok Sabha' && m.constituency) {
          const cKey = m.constituency;
          if (!constituencyMap.has(cKey)) constituencyMap.set(cKey, []);
          constituencyMap.get(cKey)!.push(risk);
        }
        
        const sKey = m.state || 'Unknown';
        if (!authorityMap.has(sKey)) authorityMap.set(sKey, []);
        authorityMap.get(sKey)!.push(risk);
      }
    });

    const getAvg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

    const constituencies = Array.from(constituencyMap.entries()).map(([k, v]) => ({ name: k, risk: getAvg(v) })).sort((a,b) => b.risk - a.risk);
    const authorities = Array.from(authorityMap.entries()).map(([k, v]) => ({ name: k, risk: getAvg(v) })).sort((a,b) => b.risk - a.risk);

    return { highRiskMembers, duplicates, anomalies, constituencies, authorities };
  }, [members, mlRisk]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !analytics) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    
    // Advanced NLP-style Heuristics Engine
    setTimeout(() => {
      let response = "I couldn't definitively map your query to the available MPLADS structural data. Please ask about risk, constituencies, authorities, anomalies, or duplicates.";
      const q = userMsg.toLowerCase();

      // 1. Constituency / District Risk
      if (q.includes('constituency') || q.includes('district') || q.includes('region')) {
        if (q.includes('risk') || q.includes('highest') || q.includes('top')) {
          const top = analytics.constituencies.slice(0, 3);
          response = `Based on aggregated predictive intelligence, the highest-risk constituencies are:\n\n1. **${top[0]?.name}** (Risk: ${top[0]?.risk.toFixed(1)})\n2. **${top[1]?.name}** (Risk: ${top[1]?.risk.toFixed(1)})\n3. **${top[2]?.name}** (Risk: ${top[2]?.risk.toFixed(1)})\n\nThese scores are the arithmetic mean of the ML anomaly scores of all member portfolios within that geographic boundary.`;
        } else {
          response = `We are currently tracking ${analytics.constituencies.length} Lok Sabha constituencies. You can view their aggregated predictive risks in the Constituency Intelligence tab.`;
        }
      }
      
      // 2. Agency / Authority Risk
      else if (q.includes('agency') || q.includes('authority') || q.includes('state nodal') || q.includes('entity')) {
        if (q.includes('risk') || q.includes('highest') || q.includes('top')) {
          const top = analytics.authorities.slice(0, 3);
          response = `Because granular agency data is unavailable in the source CSVs, I analyze execution risk at the State Nodal Authority level. The most elevated systemic risks are currently found in:\n\n1. **${top[0]?.name}** (Risk: ${top[0]?.risk.toFixed(1)})\n2. **${top[1]?.name}** (Risk: ${top[1]?.risk.toFixed(1)})\n3. **${top[2]?.name}** (Risk: ${top[2]?.risk.toFixed(1)})`;
        } else {
          response = `Granular agency data (0% coverage) is absent from the dataset. We use State Nodal Authorities as the primary implementing entity. There are ${analytics.authorities.length} authorities currently being monitored.`;
        }
      }
      
      // 3. Duplicate Detection
      else if (q.includes('duplicate') || q.includes('similar')) {
        response = `The Python ML backend (TF-IDF Cosine Similarity engine) has flagged **${analytics.duplicates.length} portfolios** as having unusually high structural similarity to other allocations, suggesting potential duplication. Please review the Risk Analysis tab for the specific entity mappings.`;
      }
      
      // 4. Anomaly Detection
      else if (q.includes('anomaly') || q.includes('outlier') || q.includes('unusual')) {
        response = `The ML Isolation Forest model has detected **${analytics.anomalies.length} statistical cost anomalies**. These portfolios deviate significantly from standard state-level allocation patterns and require manual verification.`;
      }

      // 5. General Risk
      else if (q.includes('high risk') || q.includes('high-risk') || q.includes('risk')) {
        response = `The ML Risk Engine is currently flagging **${analytics.highRiskMembers.length} member portfolios** as HIGH or CRITICAL risk. This is a unified metric combining both Isolation Forest cost anomalies and structural duplicate detection.`;
      }
      
      // 6. Fabrication / Integrity guards
      else if (q.includes('delay') || q.includes('completion date')) {
        response = "I strictly adhere to the Architectural Integrity Guard: I cannot predict specific project delays because physical timeline data is genuinely missing from the source dataset. Instead, please rely on the proxy 'Execution Risk' provided in the analytics tabs.";
      }
      
      // 7. General Aggregations
      else if (q.includes('highest allocation') || q.includes('most spent')) {
        const stateMap = new Map<string, number>();
        members.forEach(m => {
          if (m.state) stateMap.set(m.state, (stateMap.get(m.state) || 0) + m.allocatedAmount);
        });
        const highest = Array.from(stateMap.entries()).sort((a, b) => b[1] - a[1])[0];
        if (highest) {
          response = `The state managing the highest total allocation in the current dataset is **${highest[0]}** with **₹${(highest[1]/10000000).toFixed(2)} Cr**.`;
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 600);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Intelligence Assistant</h1>
        <p className="text-slate-500 mt-1 text-sm mb-6 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-500" /> Fully integrated data-aware analysis engine.
        </p>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col overflow-hidden">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-3xl gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                  msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-slate-900 text-white shadow-md'
                }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={`p-4 rounded-xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none whitespace-pre-wrap'
                }`}>
                  {/* Simple bold parsing for the assistant */}
                  {msg.role === 'assistant' ? (
                    <div dangerouslySetInnerHTML={{ 
                      __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-bold">$1</strong>') 
                    }} />
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask about high-risk constituencies, duplicate portfolios, or anomalies..."
              className="flex-1 border border-slate-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm shadow-inner"
            />
            <button 
              onClick={handleSend}
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-md font-semibold flex items-center transition-colors shadow-sm"
            >
              <Send className="w-4 h-4 mr-2" />
              Analyze
            </button>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-blue-500" />
              Querying live ML outputs and normalized state structures. Follows strict NO-FABRICATION integrity rules.
            </div>
            <div className="text-slate-400 font-mono">v2.0 Data-Aware</div>
          </div>
        </div>
      </div>
    </div>
  );
}
