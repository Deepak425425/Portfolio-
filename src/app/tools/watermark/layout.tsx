import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Watermark — Free Online Image Tool",
  description: "Use GROTON AI's free online watermark tool for professional image editing and production.",
  alternates: {
    canonical: "/tools/watermark",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
