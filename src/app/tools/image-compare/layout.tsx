import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Compare — Compare Two Images Online",
  description: "Compare images with before-and-after sliders, side-by-side views, zoom and high-resolution export.",
  alternates: {
    canonical: "/tools/image-compare",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
