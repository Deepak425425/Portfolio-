import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bulk Image Renamer — Rename Files Online",
  description: "Rename multiple images at once with custom patterns, numbering, and find-and-replace rules.",
  alternates: {
    canonical: "/tools/bulk-image-renamer",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
