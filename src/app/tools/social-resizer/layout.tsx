import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Social Resizer — Free Online Image Tool",
  description: "Use GROTON AI's free online social resizer tool for professional image editing and production.",
  alternates: {
    canonical: "/tools/social-resizer",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
