import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions — GROTON AI STUDIO",
  description: "GROTON terms of service and usage conditions.",
  alternates: {
    canonical: "/terms-and-conditions",
  },
  openGraph: {
    title: "Terms & Conditions — GROTON AI STUDIO",
    description: "GROTON terms of service and usage conditions.",
    url: "https://groton.in/terms-and-conditions",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "GROTON AI Terms & Conditions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms & Conditions — GROTON AI STUDIO",
    description: "GROTON terms of service and usage conditions.",
    images: ["https://groton.in/og-image.jpg"],
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F6] flex flex-col font-sans text-black selection:bg-black selection:text-white">
      {/* HEADER */}
      <Header />

      {/* CONTENT */}
      <main className="flex-1 w-full flex flex-col py-24 md:py-32 px-6 md:px-12 lg:px-24 max-w-4xl mx-auto">
        <div className="mb-16 border-b border-[rgba(0,0,0,0.05)] pb-12">
          <h1 className="font-sans font-bold tracking-[-0.05em] text-4xl md:text-5xl lg:text-6xl mb-6">Terms & Conditions</h1>
          <p className="text-sm text-zinc-500 font-light">Last updated: September 29, 2026</p>
        </div>

        <div className="prose prose-zinc prose-p:font-light prose-p:text-zinc-600 max-w-none">
          <p>
            {/* TODO: Legal Review Required - Replace placeholders with actual business entities before publishing */}
            Please read these Terms and Conditions ("Terms", "Terms and Conditions") carefully before using the GROTON website operated by GROTON AI STUDIO.
          </p>

          <h3 className="font-sans font-bold tracking-[-0.05em] text-2xl mt-12 mb-4">1. Acceptance of Terms</h3>
          <p>
            By accessing or using our website and services, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the service.
          </p>

          <h3 className="font-sans font-bold tracking-[-0.05em] text-2xl mt-12 mb-4">2. Creative Services and AI Production</h3>
          <p>
            GROTON provides AI-assisted visual production and creative direction services. Deliverables, revisions, and project timelines are subject to the specific Statement of Work (SOW) or project agreement established between GROTON and the client prior to project commencement.
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-4 font-light text-zinc-600 text-sm">
            <li>Visual outputs are generated using artificial intelligence guided by human art direction.</li>
            <li>Due to the nature of generative AI, exact pixel-for-pixel replication of references is not guaranteed unless specified in composite retouching phases.</li>
            <li>Pricing listed on the website is indicative; final pricing is determined by the project scope.</li>
          </ul>

          <h3 className="font-sans font-bold tracking-[-0.05em] text-2xl mt-12 mb-4">3. Intellectual Property Rights</h3>
          <p>
            Upon full payment of the agreed project fees, clients receive commercial usage rights to the final delivered visual assets as outlined in their specific contract. GROTON retains the right to display the created assets in our portfolio, case studies, and marketing materials unless a Non-Disclosure Agreement (NDA) is signed prior to commencement.
          </p>

          <h3 className="font-sans font-bold tracking-[-0.05em] text-2xl mt-12 mb-4">4. Limitation of Liability</h3>
          <p>
            In no event shall GROTON, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>

          <h3 className="font-sans font-bold tracking-[-0.05em] text-2xl mt-12 mb-4">5. Governing Law</h3>
          <p>
            These Terms shall be governed and construed in accordance with applicable law, without regard to its conflict of law provisions.
          </p>
          
          <h3 className="font-sans font-bold tracking-[-0.05em] text-2xl mt-12 mb-4">6. Contact Us</h3>
          <p>
            If you have any questions about these Terms, please contact us at:
            <br/><br/>
            <strong>GROTON AI STUDIO</strong><br/>
            Email: deepak@graflystudio.com
          </p>
        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
