import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Upscaler — Increase Image Resolution Online",
  description: "Upscale images and increase resolution without losing quality. Perfect for improving low-res e-commerce product photos and graphics.",
  alternates: {
    canonical: "/tools/image-upscaler",
  },
  openGraph: {
    title: "Image Upscaler — Increase Image Resolution Online",
    description: "Upscale images and increase resolution without losing quality. Perfect for improving low-res e-commerce product photos and graphics.",
    url: "https://groton.in/tools/image-upscaler",
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
    title: "Image Upscaler — Increase Image Resolution Online",
    description: "Upscale images and increase resolution without losing quality. Perfect for improving low-res e-commerce product photos and graphics.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
