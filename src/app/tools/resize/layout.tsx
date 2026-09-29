import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Resizer — Resize Images Online",
  description: "Resize images online with precise dimensions, aspect ratios and export controls using GROTON AI.",
  alternates: {
    canonical: "/tools/resize",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
