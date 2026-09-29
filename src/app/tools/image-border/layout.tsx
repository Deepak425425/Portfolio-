import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Border Maker — Add Frames to Images",
  description: "Add classic, vintage, Polaroid, double, film and custom borders to images with high-resolution export.",
  alternates: {
    canonical: "/tools/border",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
