'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function TestingClientLayout({ children }: { children: React.ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/testing/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        setIsUnlocked(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Incorrect password');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isUnlocked) {
    return (
            <div className="min-h-screen bg-[#F9F8F6] flex flex-col items-center justify-center p-6 font-sans relative selection:bg-[#8B7CFF] selection:text-white">
        {/* Subtle grid background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 0, 0, 0.035) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.035) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
            maskImage: "linear-gradient(to bottom, black, transparent 90%)",
            WebkitMaskImage: "linear-gradient(to bottom, black, transparent 90%)",
          }}
        />

        <Link href="/tools" className="absolute top-8 left-8 md:left-12 lg:left-24 text-zinc-500 hover:text-black transition-colors flex items-center gap-2 text-xs uppercase tracking-widest font-bold">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          Back to Tools
        </Link>
        <div className="max-w-md w-full bg-white border border-[rgba(0,0,0,0.05)] rounded-[24px] p-10 shadow-[0_18px_40px_rgba(0,0,0,0.10)] relative">
          <div className="mb-10 text-center">
            <h1 className="text-2xl font-sans font-bold tracking-[-0.05em] mb-3 text-black uppercase">Testing <span className="text-[#8B7CFF]">Lab</span></h1>
            <p className="text-zinc-500 text-sm font-light">Private experimental tools and features.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input 
                id="password"
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-[#F9F8F6] border border-[rgba(0,0,0,0.05)] rounded-lg px-4 py-3 text-black text-sm focus:outline-none focus:border-[#8B7CFF] transition-colors"
                required
              />
            </div>
            
            {error && <p className="text-red-500 text-xs text-center font-medium">{error}</p>}
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full mt-2 bg-black hover:bg-zinc-800 text-white text-[10px] uppercase tracking-[0.2em] font-bold py-4 rounded-full transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Unlock'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
