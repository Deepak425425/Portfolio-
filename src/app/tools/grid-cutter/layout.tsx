import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Grid Cutter — Free Online Image Tool",
  description: "Use GROTON AI's free online grid cutter tool for professional image editing and production.",
  alternates: {
    canonical: "/tools/grid-cutter",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
