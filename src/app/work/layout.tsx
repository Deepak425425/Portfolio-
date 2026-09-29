import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Selected Work — Premium Campaign Visuals",
  description: "Explore the GROTON AI portfolio of premium AI-powered product imagery, campaign visuals, and creative direction for modern brands.",
  alternates: {
    canonical: "https://groton.in/work",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
