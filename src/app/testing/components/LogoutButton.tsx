"use client";

import React from "react";
import { useTestingAuth } from "./TestingProvider";

export default function LogoutButton() {
  const { logout } = useTestingAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 border border-zinc-200 text-[10px] uppercase tracking-widest font-bold text-zinc-500 hover:text-black hover:border-black transition-colors"
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      Lock / Log Out
    </button>
  );
}
