import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blur — Free Online Image Tool",
  description: "Use GROTON AI's free online blur tool for professional image editing and production.",
  alternates: {
    canonical: "/tools/blur",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
