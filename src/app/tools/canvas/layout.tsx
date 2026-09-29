import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Canvas — Free Online Image Tool",
  description: "Use GROTON AI's free online canvas tool for professional image editing and production.",
  alternates: {
    canonical: "/tools/canvas",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
