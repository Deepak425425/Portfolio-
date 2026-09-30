import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Video to GIF Maker | GROTON AI",
  description: "Trim a clip, tune the output, and export a lightweight animated GIF directly in your browser."
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
