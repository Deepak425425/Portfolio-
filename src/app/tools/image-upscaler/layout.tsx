import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Upscaler — Free Online Image Tool",
  description: "Use GROTON AI's free online image upscaler tool for professional image editing and production.",
  alternates: {
    canonical: "/tools/image-upscaler",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
