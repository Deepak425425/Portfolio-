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
    default: 'GROTON AI — AI Visual Production for Modern Brands',
  },
  description: "GROTON AI creates premium AI-powered product imagery, e-commerce visuals, product-on-model images, campaign visuals and creative image tools for modern brands.",
  openGraph: {
    type: 'website',
    siteName: 'GROTON AI',
    locale: 'en_US',
    title: 'GROTON AI — AI Visual Production for Modern Brands',
    description: 'GROTON AI creates premium AI-powered product imagery, e-commerce visuals, product-on-model images, campaign visuals and creative image tools for modern brands.',
    url: 'https://groton.in',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'GROTON AI — AI Visual Production for Modern Brands',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GROTON AI — AI Visual Production for Modern Brands',
    description: 'GROTON AI creates premium AI-powered product imagery, e-commerce visuals, product-on-model images, campaign visuals and creative image tools for modern brands.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: '/',
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
              url: "https://groton.in"
            })
          }}
        />
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
