import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Split — Free Online Image Tool",
  description: "Use GROTON AI's free online split tool for professional image editing and production.",
  alternates: {
    canonical: "/tools/split",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
