import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collage — Free Online Image Tool",
  description: "Use GROTON AI's free online collage tool for professional image editing and production.",
  alternates: {
    canonical: "/tools/collage",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
