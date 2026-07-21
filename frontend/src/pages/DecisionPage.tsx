import React, { useState, useEffect, useRef } from 'react';
import { BrainCircuit, Send, FileText, Bot, User, Sparkles, Network, ArrowRight } from 'lucide-react';
import { useApexStore } from '../store/useApexStore';
import { evaluateDecision } from '../services/apexServices';
import { DecisionResponse } from '../types/apex';
import { useNavigate } from 'react-router-dom';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  decisionContext?: DecisionResponse;
}

export const DecisionPage: React.FC = () => {
  const { activeAssetId, activeFailureType, currentSimulation } = useApexStore();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial greeting
    setMessages([
      {
        id: 'msg-0',
        type: 'bot',
        content: 'Hello. I am the APEX Expert Knowledge Copilot. I have access to your live telemetry, knowledge graph, and all uploaded industrial manuals. How can I assist you with maintenance or operations today?',
      }
    ]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string = inputValue) => {
    if (!text.trim()) return;
    
    const userMsg: ChatMessage = { id: `user-${Date.now()}`, type: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate backend response based on query
    setTimeout(async () => {
      let botMsg: ChatMessage;
      
      if (text.toLowerCase().includes('p-101') || text.toLowerCase().includes('overheat') || text.toLowerCase().includes('failure')) {
        // Trigger the actual decision evaluation logic for this demo
        try {
          const res = await evaluateDecision(activeAssetId, activeFailureType, currentSimulation?.simulation_id || 'sim-demo');
          botMsg = {
            id: `bot-${Date.now()}`,
            type: 'bot',
            content: `I've analyzed the P-101 anomaly using the latest shadow simulation and RAG vectors. My primary recommendation is: **${res?.recommended_strategy || 'Isolate P-101'}**.`,
            decisionContext: res
          };
        } catch(e) {
           botMsg = { id: `bot-${Date.now()}`, type: 'bot', content: 'I encountered an error analyzing that specific asset. Please verify the asset ID.' };
        }
      } else {
        botMsg = {
          id: `bot-${Date.now()}`,
          type: 'bot',
          content: 'Based on the current operational manuals, this procedure requires LOTO (Lock-Out Tag-Out) validation. Would you like me to generate an executable runbook for this?'
        };
      }
      
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] animate-in fade-in duration-500 rounded-3xl overflow-hidden border border-[var(--glass-border)] shadow-2xl relative">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 bg-[var(--bg-secondary)]/80 backdrop-blur-md border-b border-[var(--glass-border)] z-10">
        <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 shadow-[0_0_15px_rgba(14,165,233,0.3)]">
          <BrainCircuit className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
            APEX Expert Copilot <Sparkles className="w-3.5 h-3.5 text-accent-emerald" />
          </h1>
          <p className="text-xs text-[var(--text-secondary)] font-medium">Enterprise AI trained on your manuals & knowledge graph</p>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth relative z-0" ref={scrollRef}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.type === 'bot' && (
              <div className="w-10 h-10 shrink-0 rounded-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] flex items-center justify-center text-brand-400 z-10">
                <Bot className="w-5 h-5" />
              </div>
            )}
            
            <div className={`max-w-[85%] sm:max-w-[75%] space-y-3 z-10 ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.type === 'user' 
                  ? 'bg-brand-600 text-white rounded-tr-none shadow-lg shadow-brand-600/20' 
                  : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--glass-border)] rounded-tl-none shadow-xl shadow-black/20'
              }`}>
                <p dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              </div>
              
              {/* Complex Decision Context Render */}
              {msg.decisionContext && (
                <div className="w-full bg-[var(--bg-elevated)] border border-[var(--border-strong)] p-5 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-accent-emerald bg-accent-emerald/10 px-2 py-1 rounded">
                      Confidence: {msg.decisionContext.confidence_score}%
                    </span>
                    <span className="text-xs text-[var(--text-secondary)] font-mono">
                      Risk Red: -{msg.decisionContext.estimated_risk_reduction}%
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    {msg.decisionContext.supporting_citations.map((cit, idx) => (
                      <div key={idx} className="p-3 bg-[var(--bg-primary)]/50 border border-[var(--glass-border)] rounded-xl text-xs">
                        <div className="flex items-center gap-1.5 text-brand-400 font-mono mb-1">
                          <FileText className="w-3.5 h-3.5" /> Source: {cit.document_id} (Chunk: {cit.chunk_id})
                        </div>
                        <p className="text-[var(--text-secondary)] italic">"{cit.text_snippet}"</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-accent-purple/5 border border-accent-purple/20 rounded-xl text-xs mb-4">
                    <Network className="w-4 h-4 text-accent-purple" />
                    <span className="text-[var(--text-secondary)]">Graph Traversal: <strong className="text-white">{msg.decisionContext.affected_assets.join(', ')}</strong></span>
                  </div>

                  <button 
                    onClick={() => navigate('/dashboard/runbook')}
                    className="w-full py-2.5 bg-accent-red hover:bg-accent-red/90 text-white text-xs font-bold rounded-xl transition shadow-[0_0_15px_rgba(239,68,68,0.3)] flex items-center justify-center gap-2"
                  >
                    Generate Executable Runbook <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {msg.type === 'user' && (
              <div className="w-10 h-10 shrink-0 rounded-full bg-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/30 z-10">
                <User className="w-5 h-5" />
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-4">
            <div className="w-10 h-10 shrink-0 rounded-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] flex items-center justify-center text-brand-400">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompts */}
      <div className="px-6 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar z-10">
        {['Analyze P-101 bearing overheat risk', 'What is the compliance impact of V-202 failure?', 'Show recent failures on HE-303'].map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            className="shrink-0 px-4 py-2 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-white text-xs font-medium transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[var(--bg-primary)] border-t border-[var(--glass-border)] z-10">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask the Expert Copilot about maintenance, risk, or compliance..."
            className="w-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-2xl py-4 pl-5 pr-14 text-sm text-white placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="absolute right-2 p-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:bg-[var(--bg-secondary)] disabled:text-[var(--text-secondary)] text-white transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
