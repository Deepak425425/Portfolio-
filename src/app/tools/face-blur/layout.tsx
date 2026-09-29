import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Face Blur Tool — Anonymize Photos Online",
  description: "Automatically detect and blur faces in photos for privacy and anonymity. A secure, browser-based online image tool.",
  alternates: {
    canonical: "/tools/face-blur",
  },
  openGraph: {
    title: "Face Blur Tool — Anonymize Photos Online",
    description: "Automatically detect and blur faces in photos for privacy and anonymity. A secure, browser-based online image tool.",
    url: "https://groton.in/tools/face-blur",
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
    title: "Face Blur Tool — Anonymize Photos Online",
    description: "Automatically detect and blur faces in photos for privacy and anonymity. A secure, browser-based online image tool.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
