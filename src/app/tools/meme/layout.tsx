import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meme — Free Online Image Tool",
  description: "Use GROTON AI's free online meme tool for professional image editing and production.",
  alternates: {
    canonical: "/tools/meme",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
