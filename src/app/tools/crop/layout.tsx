import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Cropper — Crop Images Online",
  description: "Crop images precisely with custom aspect ratios, zoom, positioning and high-resolution export.",
  alternates: {
    canonical: "/tools/crop",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
