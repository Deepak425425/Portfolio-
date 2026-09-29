import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rotate Flip — Free Online Image Tool",
  description: "Use GROTON AI's free online rotate flip tool for professional image editing and production.",
  alternates: {
    canonical: "/tools/rotate-flip",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
