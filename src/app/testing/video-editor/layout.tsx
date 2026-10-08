import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GROTON | Video Editor",
  description: "Simple browser-based video editing: trim, split, reorder and duplicate clips, then export to MP4.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
