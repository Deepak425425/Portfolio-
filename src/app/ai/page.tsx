"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Conversation, Message } from "@/lib/ai/types";
import { sendChatMessage } from "@/lib/ai/client";

const STORAGE_KEY = "groton_ai_conversations";

export default function AIChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [attachment, setAttachment] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed);
        if (parsed.length > 0) {
          setActiveId(parsed[0].id);
        }
      } catch (e) {
        console.error("Failed to parse conversations", e);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [conversations]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, activeId, isGenerating]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const activeConversation = conversations.find(c => c.id === activeId);
  const messages = activeConversation?.messages || [];

  const handleNewChat = () => {
    setActiveId(null);
    setInput("");
    setAttachment(null);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Create object URL for preview
    const url = URL.createObjectURL(file);
    setAttachment(url);
    // Note: To actually send to a server, we'd base64 encode or use multipart/form-data.
    // For this UI mockup, the object URL suffices for local preview.
  };

  const removeAttachment = () => {
    if (attachment) URL.revokeObjectURL(attachment);
    setAttachment(null);
  };

  const handleSend = async (customMessage?: string) => {
    const messageText = customMessage || input.trim();
    if (!messageText && !attachment) return;
    if (isGenerating) return;
    
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    let currentConversationId = activeId;
    let newConversation: Conversation | null = null;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      createdAt: Date.now(),
      image: attachment || undefined
    };

    setAttachment(null);

    if (!currentConversationId) {
      currentConversationId = Date.now().toString();
      newConversation = {
        id: currentConversationId,
        title: messageText.substring(0, 30) + (messageText.length > 30 ? "..." : ""),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [userMessage]
      };
      setConversations(prev => [newConversation!, ...prev]);
      setActiveId(currentConversationId);
    } else {
      setConversations(prev => prev.map(c => {
        if (c.id === currentConversationId) {
          return { ...c, messages: [...c.messages, userMessage], updatedAt: Date.now() };
        }
        return c;
      }));
    }

    setIsGenerating(true);

    // Call the API
    const chatHistory = currentConversationId 
      ? conversations.find(c => c.id === currentConversationId)?.messages || []
      : [];
      
    const response = await sendChatMessage({
      messages: [...chatHistory, userMessage]
    });

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.message,
      createdAt: Date.now()
    };

    setConversations(prev => prev.map(c => {
      if (c.id === currentConversationId) {
        return { ...c, messages: [...c.messages, assistantMessage], updatedAt: Date.now() };
      }
      return c;
    }));

    setIsGenerating(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (text: string) => {
    handleSend(text);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const regenerateResponse = async () => {
    if (!activeId || isGenerating) return;
    const conversation = conversations.find(c => c.id === activeId);
    if (!conversation) return;
    
    const lastUserMessageIndex = conversation.messages.map(m => m.role).lastIndexOf('user');
    if (lastUserMessageIndex === -1) return;

    // Remove everything after the last user message
    const history = conversation.messages.slice(0, lastUserMessageIndex + 1);
    
    setConversations(prev => prev.map(c => {
      if (c.id === activeId) {
        return { ...c, messages: history };
      }
      return c;
    }));

    setIsGenerating(true);

    const response = await sendChatMessage({
      messages: history
    });

    const assistantMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: response.message,
      createdAt: Date.now()
    };

    setConversations(prev => prev.map(c => {
      if (c.id === activeId) {
        return { ...c, messages: [...c.messages, assistantMessage], updatedAt: Date.now() };
      }
      return c;
    }));

    setIsGenerating(false);
  };

  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex w-full h-full relative">
      
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50
        w-[280px] bg-[#FCFCFB] border-r border-[#DEDCD5] flex flex-col
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 flex flex-col gap-6 shrink-0">
          <Link href="/" className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#8B7CFF] hover:text-[#111111] transition-colors">
            ← Back to GROTON
          </Link>
          
          <button 
            onClick={handleNewChat}
            className="w-full py-3 bg-[#111111] text-white text-[11px] uppercase tracking-widest font-bold hover:bg-[#222222] transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Chat
          </button>
          
          <input 
            type="text" 
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#DEDCD5] rounded-full px-4 py-2 text-xs focus:outline-none focus:border-[#8B7CFF] transition-colors"
          />
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-1 custom-scrollbar">
          {filteredConversations.length === 0 ? (
            <div className="text-xs text-[#6F6C66] text-center mt-4">No conversations.</div>
          ) : (
            filteredConversations.map(c => (
              <div 
                key={c.id}
                onClick={() => { setActiveId(c.id); if(window.innerWidth < 768) setIsSidebarOpen(false); }}
                className={`group flex justify-between items-center px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeId === c.id ? 'bg-[#EEEBFF] text-[#6657D9]' : 'hover:bg-[#F7F6F2] text-[#111111]'}`}
              >
                <div className="text-sm truncate pr-2">{c.title}</div>
                <button 
                  onClick={(e) => handleDeleteChat(c.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-[#6F6C66] hover:text-red-500 transition-opacity"
                  title="Delete"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))
          )}
        </div>
        
        <div className="p-4 border-t border-[#DEDCD5] shrink-0">
          <button className="w-full px-3 py-2 text-left text-xs font-bold text-[#6F6C66] hover:text-[#111111] hover:bg-[#F7F6F2] rounded-lg transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Settings
          </button>
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F7F6F2] relative h-full">
        
        {/* Header */}
        <header className="h-14 shrink-0 border-b border-[#DEDCD5] flex items-center justify-between px-4 bg-white/50 backdrop-blur-md z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-[#6F6C66] hover:text-[#111111]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#111111]">GROTON AI</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[#6F6C66]">
            <span className="w-2 h-2 rounded-full bg-[#DEDCD5]"></span>
            Offline
          </div>
        </header>

        {/* Scrollable Conversation */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 pt-8 pb-32">
          <div className="max-w-3xl mx-auto flex flex-col gap-8">
            
            {!activeConversation || messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center mt-12 md:mt-24 w-full">
                <div className="w-16 h-16 bg-white border border-[#DEDCD5] rounded-2xl flex items-center justify-center shadow-sm mb-6 text-[#8B7CFF]">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                </div>
                <h1 className="text-3xl md:text-4xl font-serif text-[#111111] mb-3">GROTON AI</h1>
                <p className="text-[#6F6C66] max-w-sm mb-12">Your creative intelligence for image production.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                  {[
                    "Analyze this product image",
                    "How can I improve this product visual?",
                    "Create a better e-commerce image brief",
                    "Which GROTON tool should I use?",
                    "Help me prepare this image for marketplace"
                  ].map((text, i) => (
                    <button 
                      key={i}
                      onClick={() => handleSuggestionClick(text)}
                      className="text-left p-4 bg-white border border-[#DEDCD5] rounded-xl hover:border-[#8B7CFF] hover:shadow-sm transition-all text-sm text-[#111111]"
                    >
                      {text}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 shrink-0 bg-white border border-[#DEDCD5] rounded-lg flex items-center justify-center text-[#8B7CFF]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    </div>
                  )}
                  
                  <div className={`flex flex-col gap-2 max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    
                    {msg.image && (
                      <div className="max-w-[240px] rounded-xl overflow-hidden border border-[#DEDCD5] shadow-sm">
                        <img src={msg.image} alt="Attachment" className="w-full h-auto object-cover" />
                      </div>
                    )}
                    
                    <div className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-[#111111] text-white rounded-br-sm' : 'bg-white border border-[#DEDCD5] text-[#111111] rounded-bl-sm shadow-sm'}`}>
                      {msg.content}
                    </div>
                    
                    {msg.role === 'assistant' && (
                      <div className="flex gap-2 mt-1">
                        <button onClick={() => copyToClipboard(msg.content)} className="p-1.5 text-[#6F6C66] hover:text-[#111111] rounded hover:bg-[#DEDCD5]/50 transition-colors" title="Copy">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </button>
                        <button onClick={regenerateResponse} className="p-1.5 text-[#6F6C66] hover:text-[#111111] rounded hover:bg-[#DEDCD5]/50 transition-colors" title="Regenerate">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {isGenerating && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 shrink-0 bg-white border border-[#DEDCD5] rounded-lg flex items-center justify-center text-[#8B7CFF]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                </div>
                <div className="px-5 py-4 rounded-2xl bg-white border border-[#DEDCD5] text-[#111111] rounded-bl-sm shadow-sm flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-[#8B7CFF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-[#8B7CFF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-[#8B7CFF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Composer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-[#F7F6F2] via-[#F7F6F2] to-transparent pointer-events-none">
          <div className="max-w-3xl mx-auto pointer-events-auto">
            
            {attachment && (
              <div className="mb-3 relative inline-block">
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#DEDCD5] shadow-sm">
                  <img src={attachment} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <button 
                  onClick={removeAttachment}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-[#111111] text-white rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}

            <div className="relative bg-white rounded-2xl shadow-sm border border-[#DEDCD5] flex items-end p-2 focus-within:border-[#8B7CFF] focus-within:shadow-[0_0_0_1px_#8B7CFF] transition-all">
              
              <label className="p-3 text-[#6F6C66] hover:text-[#111111] cursor-pointer rounded-xl hover:bg-[#F7F6F2] transition-colors shrink-0">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileAttach}
                />
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
              </label>

              <textarea 
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask GROTON AI anything..."
                className="flex-1 max-h-[200px] bg-transparent border-none focus:ring-0 resize-none py-3 px-2 text-[15px] custom-scrollbar text-[#111111] placeholder:text-[#6F6C66]"
                rows={1}
                disabled={isGenerating}
              />

              <button 
                onClick={() => handleSend()}
                disabled={isGenerating || (!input.trim() && !attachment)}
                className="p-3 bg-[#111111] text-white hover:bg-[#222222] disabled:bg-[#DEDCD5] disabled:text-white rounded-xl shrink-0 transition-colors shadow-sm ml-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>

            </div>
            
            <div className="text-center mt-3 text-[10px] text-[#6F6C66]">
              GROTON AI can make mistakes. Consider verifying important visuals.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
