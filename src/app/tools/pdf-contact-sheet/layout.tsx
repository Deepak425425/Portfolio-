import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Contact Sheet Generator — Create Photo Galleries",
  description: "Generate professional multi-image PDF contact sheets and galleries. Choose grid layouts, margins, and paper sizes online for free.",
  alternates: {
    canonical: "/tools/pdf-contact-sheet",
  },
  openGraph: {
    title: "PDF Contact Sheet Generator — Create Photo Galleries",
    description: "Generate professional multi-image PDF contact sheets and galleries. Choose grid layouts, margins, and paper sizes online for free.",
    url: "https://groton.in/tools/pdf-contact-sheet",
    siteName: "GROTON AI",
    images: [
      {
        url: "https://groton.in/og-tools.jpg",
        width: 1200,
        height: 630,
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF Contact Sheet Generator — Create Photo Galleries",
    description: "Generate professional multi-image PDF contact sheets and galleries. Choose grid layouts, margins, and paper sizes online for free.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
