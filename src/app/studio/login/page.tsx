'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/studio/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    setLoading(false);
    if (res.ok) {
      router.push('/studio');
      router.refresh();
    } else {
      setError('Invalid credentials.');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-[#0a0a0a] text-zinc-100">
      <div className="w-full max-w-sm p-8 bg-[#0d0d0d] border border-zinc-800/50 rounded-2xl shadow-2xl">
        <h1 className="text-2xl font-bold tracking-widest uppercase mb-2 text-center">Groton</h1>
        <p className="text-xs text-zinc-500 text-center uppercase tracking-[0.2em] mb-8">Site Studio</p>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input 
            type="text" 
            placeholder="Email / Username" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#8B7CFF] transition-colors"
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#8B7CFF] transition-colors"
          />
          {error && <p className="text-red-400 text-xs text-center">{error}</p>}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#8B7CFF] text-white rounded-lg px-4 py-3 text-sm font-bold tracking-widest uppercase hover:bg-[#7a6ce0] transition-colors mt-4 disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}