import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — GROTON AI STUDIO",
  description: "GROTON privacy policy and data usage terms.",
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy — GROTON AI STUDIO",
    description: "GROTON privacy policy and data usage terms.",
    url: "https://groton.in/privacy-policy",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "GROTON AI Privacy Policy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy — GROTON AI STUDIO",
    description: "GROTON privacy policy and data usage terms.",
    images: ["https://groton.in/og-image.jpg"],
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F6] flex flex-col font-sans text-black selection:bg-black selection:text-white">
      {/* HEADER */}
      <Header />

      {/* CONTENT */}
      <main className="flex-1 w-full flex flex-col pt-32 sm:pt-40 md:pt-48 pb-16 md:pb-24 px-6 md:px-12 lg:px-20 max-w-4xl xl:max-w-5xl mx-auto">
        <div className="mb-12 sm:mb-16 border-b border-[rgba(0,0,0,0.05)] pb-8 sm:pb-12">
          <h1 className="font-sans font-bold tracking-[-0.05em] text-3xl sm:text-5xl md:text-6xl mb-4 sm:mb-6">Privacy Policy</h1>
          <p className="text-sm text-zinc-500 font-light">Last updated: September 29, 2026</p>
        </div>

        <div className="prose prose-zinc prose-p:font-light prose-p:text-zinc-600 max-w-none">
          <p>
            At GROTON ("we", "our", or "us"), we are committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by GROTON.
          </p>

          <h3 className="font-sans font-bold tracking-[-0.05em] text-2xl mt-12 mb-4">1. Information We Collect</h3>
          <p>
            We collect information that you provide directly to us when you use our website, fill out a contact form, request a quote, or communicate with us. This may include:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-4 font-light text-zinc-600 text-sm">
            <li>Name and contact information (email address, phone number).</li>
            <li>Company or brand information.</li>
            <li>Details regarding your visual production projects and budget constraints.</li>
            <li>Any other information you choose to provide.</li>
          </ul>

          <h3 className="font-sans font-bold tracking-[-0.05em] text-2xl mt-12 mb-4">2. How We Use Your Information</h3>
          <p>
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-4 font-light text-zinc-600 text-sm">
            <li>Respond to your inquiries and provide creative proposals.</li>
            <li>Deliver our visual production and art direction services.</li>
            <li>Improve our website, services, and client communications.</li>
            <li>Send administrative information, such as updates to our terms or policies.</li>
          </ul>

          <h3 className="font-sans font-bold tracking-[-0.05em] text-2xl mt-12 mb-4">3. Data Sharing and Disclosure</h3>
          <p>
            We do not sell, trade, or otherwise transfer your personal identifiable information to outside parties. This does not include trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.
            <br/><br/>
            Specifically, we may share data with:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-4 font-light text-zinc-600 text-sm">
            <li>Vercel for infrastructure.</li>
          </ul>

          <h3 className="font-sans font-bold tracking-[-0.05em] text-2xl mt-12 mb-4">4. Intellectual Property & Visual Generation</h3>
          <p>
            Any visual assets, brand guidelines, or product images you upload or share with us for the purpose of AI visual generation remain your intellectual property. We only use these assets to fulfill the creative brief and do not use them to train public AI models without explicit consent.
          </p>

          <h3 className="font-sans font-bold tracking-[-0.05em] text-2xl mt-12 mb-4">5. Contact Us</h3>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
            <br/><br/>
            <strong>GROTON AI STUDIO</strong><br/>
            Jaipur, Rajasthan, India<br/>
            Email: deepak@graflystudio.com
          </p>
        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
