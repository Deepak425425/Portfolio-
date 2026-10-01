import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GROTON | Video Editor",
  description: "Simple browser-based video editing for quick cuts, trims, crops, text, audio and exports.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
