import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Passport Photo Maker — Passport & ID Photos",
  description: "Create correctly sized passport, visa and ID photo sheets with crop, print layout and export controls.",
  alternates: {
    canonical: "/tools/passport-photo",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
