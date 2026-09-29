import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Filters & Colour Grading",
  description: "Apply cinematic image effects, film looks, editorial filters and professional colour grading directly in your browser.",
  alternates: {
    canonical: "/tools/filters",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
