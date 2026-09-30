import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hard Cuts — Video Hard Cut Detector | GROTON AI",
  description: "Detect hard cuts in videos, inspect frames, and extract the first frame of every shot with GROTON AI."
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
