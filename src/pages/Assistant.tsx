import { useState, useRef, useEffect } from 'react';
import { useMembers, useMLData } from '../hooks/useData';
import { Bot, User, Send, AlertCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function Assistant() {
  const { members } = useMembers();
  const { mlRisk } = useMLData();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello. I am the MPLADS Intelligence Assistant. You can ask me questions about high-risk allocations, state allocations, or general queries about the current dataset.' }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    
    // Deterministic Handler
    setTimeout(() => {
      let response = "I don't have enough data to answer that from the current MPLADS dataset.";
      const query = userMsg.toLowerCase();

      if (query.includes('high risk') || query.includes('high-risk')) {
        if (mlRisk && mlRisk.length > 0) {
          const highRisk = mlRisk.filter((r: any) => r.risk_level === 'HIGH' || r.risk_level === 'CRITICAL');
          response = `There are currently ${highRisk.length} portfolios flagged as High or Critical risk in the selected dataset by the ML engine. You can view them in the Risk Analysis module.`;
        }
      } 
      else if (query.includes('highest expenditure') || query.includes('spent')) {
        response = "The source dataset only contains 'Allocated Amount' per member. Actual expenditure data is unavailable in the provided records.";
      }
      else if (query.includes('highest allocation') || query.includes('most allocation')) {
        const stateMap = new Map<string, number>();
        members.forEach(m => {
          if (m.state) stateMap.set(m.state, (stateMap.get(m.state) || 0) + m.allocatedAmount);
        });
        const highest = Array.from(stateMap.entries()).sort((a, b) => b[1] - a[1])[0];
        if (highest) {
          response = `The state with the highest total allocation in the current dataset is ${highest[0]} with ₹${(highest[1]/10000000).toFixed(2)} Cr.`;
        }
      }
      else if (query.includes('delay') || query.includes('delayed')) {
        response = "I cannot identify delayed projects because timeline and physical progress fields are completely missing from the current source dataset.";
      }
      else if (query.includes('lok sabha') || query.includes('rajya sabha')) {
        const house = query.includes('lok sabha') ? 'Lok Sabha' : 'Rajya Sabha';
        const count = members.filter(m => m.house === house).length;
        response = `There are ${count} records for ${house} in the current active filter context.`;
      }
      else if (query.includes('total')) {
        const total = members.reduce((a, b) => a + b.allocatedAmount, 0);
        response = `The total allocated amount for all members in the current view is ₹${(total/10000000).toFixed(2)} Cr across ${members.length} records.`;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI Assistant</h1>
        <p className="text-slate-500 mt-1 text-sm mb-6">
          Prototype deterministic data-aware query handler.
        </p>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col overflow-hidden">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-2xl gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-slate-900 text-white'
                }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={`p-4 rounded-lg text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
                }`}>
                  {msg.content}
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
              placeholder="Ask about allocations, risk signals, or states..."
              className="flex-1 border border-slate-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button 
              onClick={handleSend}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold flex items-center transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            Deterministic prototype. Does not hallucinate non-existent project data.
          </div>
        </div>
      </div>
    </div>
  );
}
