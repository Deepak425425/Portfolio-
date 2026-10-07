import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Background Remover — Isolate Subjects & Remove Backgrounds Online",
  description: "Instantly remove backgrounds from images online. Isolate subjects, create transparent PNGs, and prepare product images for e-commerce with Groton AI's free image tool.",
  alternates: {
    canonical: "/tools/background-remover",
  },
  openGraph: {
    title: "Background Remover — Isolate Subjects & Remove Backgrounds Online",
    description: "Instantly remove backgrounds from images online. Isolate subjects, create transparent PNGs, and prepare product images for e-commerce with Groton AI's free image tool.",
    url: "https://groton.in/tools/background-remover",
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
    title: "Background Remover — Isolate Subjects & Remove Backgrounds Online",
    description: "Instantly remove backgrounds from images online. Isolate subjects, create transparent PNGs, and prepare product images for e-commerce with Groton AI's free image tool.",
    images: ["https://groton.in/og-tools.jpg"],
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
