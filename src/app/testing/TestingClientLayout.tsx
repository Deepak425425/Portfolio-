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
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-sans">
        <Link href="/tools" className="absolute top-8 left-8 text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          Back to Tools
        </Link>
        <div className="max-w-md w-full bg-[#0a0a0a] border border-zinc-800 rounded-2xl p-10 shadow-2xl">
          <div className="mb-10 text-center">
            <h1 className="text-2xl font-bold tracking-widest uppercase mb-3 text-white">Testing<span className="text-[#8B7CFF]">Lab</span></h1>
            <p className="text-zinc-400 text-sm">Private experimental tools and features.</p>
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
                className="w-full bg-[#111] border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#8B7CFF] transition-colors"
                required
              />
            </div>
            
            {error && <p className="text-red-500 text-xs text-center">{error}</p>}
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full mt-2 bg-[#8B7CFF] hover:bg-[#7a6ce0] text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
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
