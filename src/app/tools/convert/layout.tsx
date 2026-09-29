import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Convert — Free Online Image Tool",
  description: "Use GROTON AI's free online convert tool for professional image editing and production.",
  alternates: {
    canonical: "/tools/convert",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
