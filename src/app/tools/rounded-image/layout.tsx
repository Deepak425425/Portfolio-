import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rounded Image — Free Online Image Tool",
  description: "Use GROTON AI's free online rounded image tool for professional image editing and production.",
  alternates: {
    canonical: "/tools/rounded-image",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
