import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Face Blur — Free Online Image Tool",
  description: "Use GROTON AI's free online face blur tool for professional image editing and production.",
  alternates: {
    canonical: "/tools/face-blur",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
