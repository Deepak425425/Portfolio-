import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cinematic Focus — Radial Blur & Focus Effects",
  description: "Create cinematic focus, film looks, editorial filters, analog textures and optical effects.",
  alternates: {
    canonical: "/tools/cinematic-focus",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
