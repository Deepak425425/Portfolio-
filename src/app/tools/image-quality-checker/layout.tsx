import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Quality Checker — Free Online Image Tool",
  description: "Use GROTON AI's free online image quality checker tool for professional image editing and production.",
  alternates: {
    canonical: "/tools/image-quality-checker",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
