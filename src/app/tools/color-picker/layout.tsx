import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Color Picker — Free Online Image Tool",
  description: "Use GROTON AI's free online color picker tool for professional image editing and production.",
  alternates: {
    canonical: "/tools/color-picker",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
