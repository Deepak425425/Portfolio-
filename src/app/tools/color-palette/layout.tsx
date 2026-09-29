import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Color Palette Generator — Extract Colors from Image",
  description: "Automatically generate a color palette from any image. Extract dominant HEX colors and create aesthetic mood boards with Groton AI's free tool.",
  alternates: {
    canonical: "/tools/color-palette",
  },
  openGraph: {
    title: "Color Palette Generator — Extract Colors from Image",
    description: "Automatically generate a color palette from any image. Extract dominant HEX colors and create aesthetic mood boards with Groton AI's free tool.",
    url: "https://groton.in/tools/color-palette",
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
    title: "Color Palette Generator — Extract Colors from Image",
    description: "Automatically generate a color palette from any image. Extract dominant HEX colors and create aesthetic mood boards with Groton AI's free tool.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
