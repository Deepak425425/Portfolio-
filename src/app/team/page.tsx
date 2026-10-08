import type { Metadata } from "next";
import { getTeamData } from "@/lib/team";
import TeamPageClient from "@/components/team/TeamPageClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Team — GROTON AI STUDIO",
  description: "The creative directors, visual engineers, and artists behind GROTON AI Studio.",
  alternates: {
    canonical: "/team",
  },
  openGraph: {
    title: "Team — GROTON AI STUDIO",
    description: "The creative directors, visual engineers, and artists behind GROTON AI Studio.",
    url: "https://groton.in/team",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "The Team at GROTON AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Team — GROTON AI STUDIO",
    description: "The creative directors, visual engineers, and artists behind GROTON AI Studio.",
    images: ["https://groton.in/og-image.jpg"],
  },
};

export default async function TeamPage() {
  const teamData = await getTeamData();
  return <TeamPageClient initialData={teamData} />;
}
