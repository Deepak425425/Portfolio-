"use client";

import React, { useState } from "react";
import { authenticateTestingLab } from "../actions";

export default function TestingLoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    
    setLoading(true);
    setError("");
    
    try {
      const result = await authenticateTestingLab(password);
      if (result.success) {
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(result.error || "Authentication failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans text-black justify-center items-center px-6">
      <div className="w-full max-w-md bg-white border border-zinc-200 p-8 md:p-12 shadow-sm text-center">
        <h1 className="font-bold tracking-[0.3em] text-sm uppercase text-black mb-2">GROTON AI</h1>
        <h2 className="font-serif text-3xl mb-4 text-[#111111]">Testing Lab</h2>
        <p className="text-zinc-500 font-light text-sm mb-8">
          Experimental tools and features in development.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="PASSWORD"
            className="w-full border-b border-zinc-300 py-3 text-center bg-transparent focus:outline-none focus:border-[#111111] transition-colors font-light tracking-[0.1em] text-sm"
          />
          {error && <div className="text-xs text-red-500 mt-2">{error}</div>}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-4 bg-[#111111] text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#222222] transition-colors disabled:opacity-50"
          >
            {loading ? "UNLOCKING..." : "UNLOCK TESTING LAB"}
          </button>
        </form>
      </div>
    </div>
  );
}
