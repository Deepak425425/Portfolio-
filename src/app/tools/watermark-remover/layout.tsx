import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Watermark Remover — Content-Aware Object Removal",
  description: "Remove unwanted marks, objects, text and watermarks from images using intelligent browser-side inpainting.",
  alternates: {
    canonical: "/tools/watermark-remover",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
