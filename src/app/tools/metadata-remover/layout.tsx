import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Metadata Remover — Free Online Image Tool",
  description: "Use GROTON AI's free online metadata remover tool for professional image editing and production.",
  alternates: {
    canonical: "/tools/metadata-remover",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
