import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Background Remover — Free Online Image Tool",
  description: "Use GROTON AI's free online background remover tool for professional image editing and production.",
  alternates: {
    canonical: "/tools/background-remover",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
