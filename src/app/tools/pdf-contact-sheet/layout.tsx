import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pdf Contact Sheet — Free Online Image Tool",
  description: "Use GROTON AI's free online pdf contact sheet tool for professional image editing and production.",
  alternates: {
    canonical: "/tools/pdf-contact-sheet",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
