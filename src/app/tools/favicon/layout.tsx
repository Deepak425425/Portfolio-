import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favicon — Free Online Image Tool",
  description: "Use GROTON AI's free online favicon tool for professional image editing and production.",
  alternates: {
    canonical: "/tools/favicon",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
