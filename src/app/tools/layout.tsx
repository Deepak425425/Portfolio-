import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Groton Image Tools — Free Online Image Editors",
  description: "Explore free online image tools by Groton. Resize, crop, compress, convert, add borders, extract colors, apply filters and prepare product images directly in your browser.",
  alternates: {
    canonical: "https://groton.in/tools",
  },
  openGraph: {
    title: "Groton Image Tools — Free Online Image Editors",
    description: "Explore free online image tools by Groton. Resize, crop, compress, convert, add borders, extract colors, apply filters and prepare product images directly in your browser.",
    url: "https://groton.in/tools",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
