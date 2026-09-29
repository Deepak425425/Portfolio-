import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favicon Generator — Create .ico & Web App Icons",
  description: "Convert any image into a web-ready favicon.ico and high-resolution app icons for modern websites. Free online utility by Groton AI.",
  alternates: {
    canonical: "/tools/favicon",
  },
  openGraph: {
    title: "Favicon Generator — Create .ico & Web App Icons",
    description: "Convert any image into a web-ready favicon.ico and high-resolution app icons for modern websites. Free online utility by Groton AI.",
    url: "https://groton.in/tools/favicon",
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
    title: "Favicon Generator — Create .ico & Web App Icons",
    description: "Convert any image into a web-ready favicon.ico and high-resolution app icons for modern websites. Free online utility by Groton AI.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
