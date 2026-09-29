import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Cleanup — Free Online Image Tool",
  description: "Use GROTON AI's free online image cleanup tool for professional image editing and production.",
  alternates: {
    canonical: "/tools/image-cleanup",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
