import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compressor — Free Online Image Tool",
  description: "Use GROTON AI's free online compressor tool for professional image editing and production.",
  alternates: {
    canonical: "/tools/compressor",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
