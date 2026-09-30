"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { matchIntent, RegisteredTool } from '@/lib/ai/localRouter';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  tools?: RegisteredTool[];
  confidence?: 'high' | 'multiple' | 'none';
  isCompactTool?: boolean;
}

export default function AskAIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSend = (overrideText?: string) => {
    const query = overrideText || input.trim();
    if (!query || isProcessing) return;

    setIsProcessing(true);

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: query
    };
    
    setInput(''); 
    setMessages(prev => [...prev, userMessage]);

    const match = matchIntent(query, messages.map(m => m.text));
    
    setTimeout(() => {
      let responseText = '';
      let isCompactTool = false;
      
      const alreadyRecommended = match.tools.length > 0 && messages.some(m => 
        m.role === 'assistant' && 
        m.tools && m.tools.length > 0 && 
        m.tools[0].id === match.tools[0].id
      );

      if (match.customResponse) {
        responseText = match.customResponse;
      } else if (match.confidence === 'high') {
        const primaryTool = match.tools[0];
        if (primaryTool.capability === 'planned') {
          responseText = `I understand — you want to ${primaryTool.name.toLowerCase()}. GROTON doesn't have a dedicated tool for that yet.\n\nThat tool can be added to GROTON later.`;
        } else if (alreadyRecommended) {
          responseText = `Yes — **${primaryTool.name.toUpperCase()}** is the relevant tool.`;
          isCompactTool = true;
        } else {
          responseText = `Sure — use **${primaryTool.name}**.\n\n${primaryTool.description}`;
        }
      } else if (match.confidence === 'multiple') {
        responseText = 'I found a few tools that could help. Could you clarify which one you need?';
      } else {
        responseText = "I don't have that information built into GROTON AI yet.\n\nTry asking me about GROTON tools, basic image/video concepts, or date and time.";
      }
      
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: responseText,
        tools: match.tools,
        confidence: match.confidence,
        isCompactTool
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
    }, 400); 
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const assistantUI = (
    <div className="flex flex-col h-full bg-[#FCFCFB] border border-[#DEDCD5] md:rounded-2xl shadow-xl overflow-hidden pointer-events-auto">
      <div className="bg-white border-b border-[#DEDCD5] p-4 flex justify-between items-center shrink-0">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[#8B7CFF]">✦</span>
            <span className="font-bold text-[11px] uppercase tracking-widest text-[#111111]">ASK AI</span>
          </div>
          <span className="text-[10px] text-[#6F6C66] mt-0.5">Find the right GROTON tool.</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[9px] uppercase font-bold tracking-widest text-[#6F6C66] bg-[#F7F6F2] px-2 py-1 rounded">
            I'M DEEPAK
          </div>
          
          <div className="flex items-center gap-1 border-l border-[#DEDCD5] pl-3">
            {messages.length > 0 && (
              <button 
                onClick={() => setMessages([])} 
                className="text-[#6F6C66] hover:text-[#111111] p-1 transition-colors"
                title="New Chat"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            )}
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-[#6F6C66] hover:text-[#111111] p-1 transition-colors"
              title="Close Assistant"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar bg-[#FCFCFB] relative">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-8 text-center px-4 animate-fade-in mt-10">
            <div className="flex flex-col gap-3">
              <h2 className="text-[22px] md:text-2xl font-serif tracking-tight text-[#111111] leading-snug">
                Hi, I’m Deepak,<br/>your AI assistant.
              </h2>
              <p className="text-[13px] text-[#6F6C66] tracking-wide">How can I help you today?</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 mt-2 w-full max-w-[280px]">
              <button onClick={() => handleSend("Find a tool")} className="bg-white border border-[#DEDCD5] hover:border-[#8B7CFF] text-[#111111] px-4 py-2.5 rounded-full text-[10px] uppercase font-bold tracking-widest transition-colors shadow-sm">
                FIND A TOOL
              </button>
              <button onClick={() => handleSend("Image tools")} className="bg-white border border-[#DEDCD5] hover:border-[#8B7CFF] text-[#111111] px-4 py-2.5 rounded-full text-[10px] uppercase font-bold tracking-widest transition-colors shadow-sm">
                IMAGE TOOLS
              </button>
              <button onClick={() => handleSend("Video tools")} className="bg-white border border-[#DEDCD5] hover:border-[#8B7CFF] text-[#111111] px-4 py-2.5 rounded-full text-[10px] uppercase font-bold tracking-widest transition-colors shadow-sm">
                VIDEO TOOLS
              </button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col max-w-[90%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
                <div className={`px-4 py-3 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap shadow-sm ${msg.role === 'user' ? 'bg-[#111111] text-white rounded-br-sm' : 'bg-white border border-[#DEDCD5] text-[#111111] rounded-bl-sm'}`}>
                  {msg.text.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="font-bold block my-1 text-[#8B7CFF]">{part}</strong> : part)}
                </div>

                {msg.role === 'assistant' && msg.tools && msg.tools.length > 0 && (
                  <div className="flex flex-col gap-2 mt-3 w-full">
                    {msg.tools.map((tool) => {
                      if (tool.route) {
                        return (
                          <Link 
                            key={tool.id} 
                            href={tool.route}
                            onClick={() => { if(window.innerWidth < 1280) setIsOpen(false); }}
                            className="w-full flex flex-col gap-1 bg-white border border-[#DEDCD5] p-3 rounded-xl hover:border-[#8B7CFF] hover:shadow-sm transition-all group"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-[11px] font-bold uppercase tracking-widest text-[#111111] group-hover:text-[#8B7CFF] transition-colors">{tool.name}</span>
                              <svg className="w-3.5 h-3.5 text-[#6F6C66] group-hover:text-[#8B7CFF] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </div>
                            {msg.confidence === 'multiple' && (
                              <span className="text-[10px] text-[#6F6C66]">{tool.description}</span>
                            )}
                          </Link>
                        );
                      } else {
                        return (
                          <div 
                            key={tool.id} 
                            className="w-full flex flex-col gap-1 bg-[#F7F6F2] border border-[#DEDCD5] p-3 rounded-xl opacity-80"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-[11px] font-bold uppercase tracking-widest text-[#6F6C66]">{tool.name}</span>
                              <span className="text-[9px] uppercase font-bold tracking-widest text-[#6F6C66] bg-[#EAE8E1] px-2 py-0.5 rounded">
                                Not available yet
                              </span>
                            </div>
                            {msg.confidence === 'multiple' && (
                              <span className="text-[10px] text-[#6F6C66]">{tool.description}</span>
                            )}
                          </div>
                        );
                      }
                    })}
                    
                    {msg.confidence === 'high' && !msg.isCompactTool && (
                      <button onClick={() => handleSend("Not what I meant")} className="text-left text-[10px] text-[#6F6C66] hover:text-[#111111] mt-1 pl-1">
                        Not what I meant
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-[#DEDCD5] shrink-0">
        <div className="relative bg-[#F7F6F2] border border-[#DEDCD5] rounded-xl flex items-end p-1 focus-within:border-[#8B7CFF] transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What do you want to do?"
            className="flex-1 max-h-[120px] bg-transparent border-none focus:ring-0 resize-none py-2.5 px-3 text-[13px] text-[#111111] placeholder:text-[#6F6C66]"
            rows={1}
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="p-2 mb-0.5 bg-[#111111] text-white hover:bg-[#8B7CFF] disabled:bg-[#DEDCD5] rounded-lg shrink-0 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <button 
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 bg-[#111111] text-white px-5 py-4 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-105 transition-transform"
          >
            <span className="text-[#8B7CFF]">✦</span>
            <span className="text-[11px] font-bold uppercase tracking-widest">Ask AI</span>
          </button>
        </div>
      )}

      {isOpen && (
        <>
          <div className="hidden md:block fixed bottom-6 right-6 w-[360px] h-[600px] z-50 pointer-events-none">
            {assistantUI}
          </div>

          <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end pointer-events-none">
            <div className="absolute inset-0 bg-black/40 pointer-events-auto" onClick={() => setIsOpen(false)} />
            <div className="w-full h-[85vh] bg-white rounded-t-3xl overflow-hidden pointer-events-auto flex flex-col translate-y-0 transition-transform shadow-2xl">
              <div className="w-12 h-1.5 bg-[#DEDCD5] rounded-full mx-auto my-3 shrink-0" />
              <div className="flex-1 overflow-hidden p-0">
                 {assistantUI}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
