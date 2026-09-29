import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Before After — Free Online Image Tool",
  description: "Use GROTON AI's free online before after tool for professional image editing and production.",
  alternates: {
    canonical: "/tools/before-after",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
