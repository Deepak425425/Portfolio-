import React from "react";
import type { Metadata } from "next";
import { TestingProvider } from "./components/TestingProvider";

export const metadata: Metadata = {
  title: "Testing Lab — GROTON AI",
  description: "Experimental tools and features in development.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function TestingLayout({ children }: { children: React.ReactNode }) {
  return <TestingProvider>{children}</TestingProvider>;
}
