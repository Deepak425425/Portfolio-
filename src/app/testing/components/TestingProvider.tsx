"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import TestingLoginForm from "./TestingLoginForm";
import { usePathname, useRouter } from "next/navigation";

const TestingContext = createContext<{
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
} | null>(null);

export function TestingProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const login = () => setIsAuthenticated(true);
  const logout = () => {
    setIsAuthenticated(false);
    // When logged out, push to /testing to show the login form
    if (pathname !== "/testing") {
      router.push("/testing");
    }
  };

  // If we are at a tool path but not authenticated, show login form instead of children.
  // Wait, if not authenticated, we ALWAYS show TestingLoginForm instead of children.
  // If the path is /testing/some-tool, and not authenticated, TestingLoginForm is shown.
  // When they log in, children is shown (which is the tool content).
  // But wait, if they directly visited /testing/some-tool, the URL stays /testing/some-tool.
  // The user requirement: "If the user opens: /testing/some-tool directly without the current valid Testing Lab access: -> redirect to /testing -> show password screen."
  // So we must actually redirect them to /testing!

  useEffect(() => {
    if (!isAuthenticated && pathname !== "/testing") {
      router.replace("/testing");
    }
  }, [isAuthenticated, pathname, router]);

  if (!isAuthenticated) {
    return <TestingLoginForm onSuccess={login} />;
  }

  return (
    <TestingContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </TestingContext.Provider>
  );
}

export const useTestingAuth = () => {
  const ctx = useContext(TestingContext);
  if (!ctx) throw new Error("useTestingAuth must be used within TestingProvider");
  return ctx;
};
