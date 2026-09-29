import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pixelate — Free Online Image Tool",
  description: "Use GROTON AI's free online pixelate tool for professional image editing and production.",
  alternates: {
    canonical: "/tools/pixelate",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
