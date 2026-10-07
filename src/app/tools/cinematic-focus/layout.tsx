import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cinematic Focus Engine — Optical Blur & Film Effects",
  description: "Create cinematic focus, radial blur, tilt-shift, and editorial film looks online. A professional grade visual effects tool by Groton AI.",
  alternates: {
    canonical: "/tools/cinematic-focus",
  },
  openGraph: {
    title: "Cinematic Focus Engine — Optical Blur & Film Effects",
    description: "Create cinematic focus, radial blur, tilt-shift, and editorial film looks online. A professional grade visual effects tool by Groton AI.",
    url: "https://groton.in/tools/cinematic-focus",
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
    title: "Cinematic Focus Engine — Optical Blur & Film Effects",
    description: "Create cinematic focus, radial blur, tilt-shift, and editorial film looks online. A professional grade visual effects tool by Groton AI.",
    images: ["https://groton.in/og-tools.jpg"],
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
