import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Color Palette — Free Online Image Tool",
  description: "Use GROTON AI's free online color palette tool for professional image editing and production.",
  alternates: {
    canonical: "/tools/color-palette",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
