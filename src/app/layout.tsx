import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

import CustomCursor from "@/components/CustomCursor";

export const metadata: Metadata = {
  metadataBase: new URL('https://groton.in'),
  title: {
    template: '%s | GROTON AI',
    default: 'Groton — Image Tools & Creative Image Production',
  },
  description: "Groton AI provides powerful online image tools for editing, formatting, comparing, enhancing and preparing images for creative and e-commerce workflows.",
  openGraph: {
    type: 'website',
    siteName: 'GROTON AI',
    locale: 'en_US',
    title: 'Groton — Image Tools & Creative Image Production',
    description: 'Groton AI provides powerful online image tools for editing, formatting, comparing, enhancing and preparing images for creative and e-commerce workflows.',
    url: 'https://groton.in',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Groton — Image Tools & Creative Image Production',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Groton — Image Tools & Creative Image Production',
    description: 'Groton AI provides powerful online image tools for editing, formatting, comparing, enhancing and preparing images for creative and e-commerce workflows.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-black selection:text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "GROTON AI",
              url: "https://groton.in"
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "GROTON AI",
              url: "https://groton.in",
              logo: "https://groton.in/logo.png"
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Groton Image Tools",
              url: "https://groton.in/tools",
              applicationCategory: "MultimediaApplication",
              operatingSystem: "All",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD"
              }
            })
          }}
        />
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
