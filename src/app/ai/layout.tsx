import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "GROTON AI — Creative AI Assistant",
  description: "An AI creative assistant for image production, e-commerce visuals, and GROTON creative tools."
};

export default function AILayout({ children }: { children: React.ReactNode }) {
  // We remove the default Navigation/Footer for the AI route to keep it full-screen and app-like
  return (
    <div className="flex h-screen bg-[#F7F6F2] font-sans text-[#111111] overflow-hidden">
      {children}
    </div>
  );
}
