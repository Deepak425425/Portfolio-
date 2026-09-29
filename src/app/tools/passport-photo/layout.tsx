import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Passport Photo Maker — Create ID Photos Online",
  description: "Format and crop photos to standard passport, visa, and ID dimensions. Generate print-ready sheets with Groton's online passport photo maker.",
  alternates: {
    canonical: "/tools/passport-photo",
  },
  openGraph: {
    title: "Passport Photo Maker — Create ID Photos Online",
    description: "Format and crop photos to standard passport, visa, and ID dimensions. Generate print-ready sheets with Groton's online passport photo maker.",
    url: "https://groton.in/tools/passport-photo",
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
    title: "Passport Photo Maker — Create ID Photos Online",
    description: "Format and crop photos to standard passport, visa, and ID dimensions. Generate print-ready sheets with Groton's online passport photo maker.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
