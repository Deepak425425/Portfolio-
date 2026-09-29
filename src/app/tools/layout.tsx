import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GROTON AI Tools — Free Image Editing & Creative Tools",
  description: "Explore GROTON AI's browser-based image tools for resizing, cropping, compression, color palettes, collages, passport photos, borders, filters, image comparison and more.",
  alternates: {
    canonical: "/tools",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
