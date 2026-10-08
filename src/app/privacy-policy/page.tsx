import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — GROTON AI Studio",
  description: "Privacy Policy for GROTON AI Studio. Learn how we handle information, client assets, and data responsibly.",
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy — GROTON AI Studio",
    description: "Privacy Policy for GROTON AI Studio. Learn how we handle information, client assets, and data responsibly.",
    url: "https://groton.in/privacy-policy",
    siteName: "GROTON AI Studio",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "GROTON AI Studio Privacy Policy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy — GROTON AI Studio",
    description: "Privacy Policy for GROTON AI Studio. Learn how we handle information, client assets, and data responsibly.",
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
          <p className="text-sm text-zinc-500 font-light">Last Updated: October 2026</p>
        </div>

        <div className="prose prose-zinc prose-p:font-light prose-p:text-zinc-600 max-w-none">
          <p className="mb-4 text-base sm:text-lg leading-relaxed font-light text-zinc-600">
            At GROTON AI Studio, we respect your privacy and are committed to handling your information responsibly. This Privacy Policy explains what information we may collect when you use our website, how we use it, and how we handle information shared with us when you enquire about or use our services.
          </p>
          <p className="mb-8 text-base sm:text-lg leading-relaxed font-light text-zinc-600">
            GROTON AI Studio is an AI-powered visual production studio focused on creating premium visual content for modern e-commerce brands.
          </p>

          <h2 className="font-sans font-bold tracking-[-0.05em] text-2xl mt-12 mb-4 text-black">1. Information We Collect</h2>
          <p className="mb-4 leading-relaxed">
            We may collect information that you voluntarily provide when you contact us, request a quote, discuss a project, or otherwise communicate with GROTON AI Studio.
          </p>
          <p className="mb-2 leading-relaxed">
            Depending on how you interact with us, this may include:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-6 font-light text-zinc-600 text-sm">
            <li>Your name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Company or brand name</li>
            <li>Project requirements</li>
            <li>Budget or service preferences</li>
            <li>Product or campaign information</li>
            <li>Any other information you choose to provide in your communication with us</li>
          </ul>
          <p className="mb-8 leading-relaxed">
            We may also collect limited technical information automatically when you use our website, such as information necessary for the website to function properly or for basic security and performance purposes.
          </p>

          <h2 className="font-sans font-bold tracking-[-0.05em] text-2xl mt-12 mb-4 text-black">2. How We Use Your Information</h2>
          <p className="mb-2 leading-relaxed">
            We use information provided to us for legitimate business purposes, including:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-6 font-light text-zinc-600 text-sm">
            <li>Responding to enquiries and requests</li>
            <li>Understanding your project requirements</li>
            <li>Preparing quotes or proposals</li>
            <li>Communicating with you about requested services</li>
            <li>Providing and managing our services</li>
            <li>Managing client projects and deliverables</li>
            <li>Maintaining and improving our website and services where applicable</li>
            <li>Protecting the website and our business from misuse or unauthorized activity</li>
          </ul>
          <p className="mb-8 leading-relaxed">
            We only use information for purposes reasonably connected to the interaction or service for which it was provided, unless another use is required or permitted by law.
          </p>

          <h2 className="font-sans font-bold tracking-[-0.05em] text-2xl mt-12 mb-4 text-black">3. Client-Provided Product Images and Creative Assets</h2>
          <p className="mb-4 leading-relaxed">
            GROTON AI Studio may receive product images, brand assets, product information, brand guidelines, creative references, campaign references, and other materials from clients as part of a visual-production project.
          </p>
          <p className="mb-4 leading-relaxed">
            These materials may be used to understand the project and to create, edit, develop, review, or deliver the requested visual content.
          </p>
          <p className="mb-4 leading-relaxed">
            Client-provided materials are treated as project-related information and are not intended to be publicly published by GROTON AI Studio unless the client has provided permission or the material is otherwise intended for public use.
          </p>
          <p className="mb-8 leading-relaxed">
            Clients remain responsible for ensuring that they have the necessary rights and permissions to provide the materials they send to us.
          </p>

          <h2 className="font-sans font-bold tracking-[-0.05em] text-2xl mt-12 mb-4 text-black">4. AI-Powered Visual Production</h2>
          <p className="mb-4 leading-relaxed">
            GROTON AI Studio uses AI-assisted creative workflows as part of its visual-production process.
          </p>
          <p className="mb-4 leading-relaxed">
            Depending on the project, client-provided materials may be processed through tools or services used to create or develop requested visual content.
          </p>
          <p className="mb-4 leading-relaxed">
            We use such tools for the purpose of delivering the requested creative service and managing the associated project workflow.
          </p>
          <p className="mb-8 leading-relaxed">
            Where third-party technology is involved, the handling of information may also be subject to the relevant third party&apos;s terms and privacy practices.
          </p>

          <h2 className="font-sans font-bold tracking-[-0.05em] text-2xl mt-12 mb-4 text-black">5. Sharing of Information</h2>
          <p className="mb-4 leading-relaxed">
            We do not sell your personal information.
          </p>
          <p className="mb-4 leading-relaxed">
            We may share information with service providers or technology providers when reasonably necessary to operate our website, communicate with clients, process project information, provide requested services, or maintain our business operations.
          </p>
          <p className="mb-4 leading-relaxed">
            Where third-party services are used, we aim to use them only for legitimate business purposes relevant to the service being provided.
          </p>
          <p className="mb-8 leading-relaxed">
            We may also disclose information where required by law, legal process, or to protect our rights, property, security, or the safety of others.
          </p>

          <h2 className="font-sans font-bold tracking-[-0.05em] text-2xl mt-12 mb-4 text-black">6. Data Security</h2>
          <p className="mb-4 leading-relaxed">
            We take reasonable measures to protect information provided to us against unauthorized access, misuse, alteration, or disclosure.
          </p>
          <p className="mb-4 leading-relaxed">
            However, no method of transmitting or storing information online can be guaranteed to be completely secure.
          </p>
          <p className="mb-8 leading-relaxed">
            For this reason, we cannot guarantee absolute security of information transmitted through the internet.
          </p>

          <h2 className="font-sans font-bold tracking-[-0.05em] text-2xl mt-12 mb-4 text-black">7. Data Retention</h2>
          <p className="mb-4 leading-relaxed">
            We retain information for as long as reasonably necessary for the purpose for which it was collected, including providing services, maintaining business records, resolving disputes, complying with legal obligations, and protecting our legitimate business interests.
          </p>
          <p className="mb-8 leading-relaxed">
            The period for which information is retained may vary depending on the type of information and the nature of the relationship or project.
          </p>

          <h2 className="font-sans font-bold tracking-[-0.05em] text-2xl mt-12 mb-4 text-black">8. Cookies and Website Technologies</h2>
          <p className="mb-4 leading-relaxed">
            Our website may use cookies or similar technologies where necessary for website functionality, security, performance, or other legitimate website operations.
          </p>
          <p className="mb-4 leading-relaxed">
            Where analytics or similar technologies are used, they may collect limited information about how visitors interact with the website.
          </p>
          <p className="mb-8 leading-relaxed">
            We do not use cookies for the purpose of selling your personal information.
          </p>

          <h2 className="font-sans font-bold tracking-[-0.05em] text-2xl mt-12 mb-4 text-black">9. Your Rights</h2>
          <p className="mb-2 leading-relaxed">
            Depending on applicable law, you may have rights relating to your personal information, including the ability to:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-6 font-light text-zinc-600 text-sm">
            <li>Request information about personal data we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of information where legally applicable</li>
            <li>Ask questions about how your information is being used</li>
            <li>Withdraw consent where processing is based on consent</li>
          </ul>
          <p className="mb-8 leading-relaxed">
            To make a privacy-related request, you can contact us using the contact details provided below.
          </p>

          <h2 className="font-sans font-bold tracking-[-0.05em] text-2xl mt-12 mb-4 text-black">10. Third-Party Websites and Services</h2>
          <p className="mb-4 leading-relaxed">
            Our website or communications may contain links to third-party websites, platforms, or services.
          </p>
          <p className="mb-4 leading-relaxed">
            GROTON AI Studio is not responsible for the privacy practices, security, or content of third-party websites.
          </p>
          <p className="mb-8 leading-relaxed">
            We recommend reviewing the privacy policies of any third-party service you choose to use.
          </p>

          <h2 className="font-sans font-bold tracking-[-0.05em] text-2xl mt-12 mb-4 text-black">11. Children&apos;s Privacy</h2>
          <p className="mb-4 leading-relaxed">
            Our website and services are intended for businesses, professionals, and general audiences and are not specifically directed toward children.
          </p>
          <p className="mb-8 leading-relaxed">
            We do not knowingly collect personal information from children for the purpose of providing our services.
          </p>

          <h2 className="font-sans font-bold tracking-[-0.05em] text-2xl mt-12 mb-4 text-black">12. Changes to This Privacy Policy</h2>
          <p className="mb-4 leading-relaxed">
            We may update this Privacy Policy from time to time to reflect changes in our services, website, business practices, or applicable requirements.
          </p>
          <p className="mb-8 leading-relaxed">
            When changes are made, the updated version will be published on this page with a revised “Last Updated” date.
          </p>

          <h2 className="font-sans font-bold tracking-[-0.05em] text-2xl mt-12 mb-4 text-black">13. Contact Us</h2>
          <p className="mb-4 leading-relaxed">
            If you have questions about this Privacy Policy, how your information is handled, or want to make a privacy-related request, please contact GROTON AI Studio.
          </p>
          <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-xl my-6 not-prose">
            <p className="font-bold text-black text-sm uppercase tracking-wider mb-2">GROTON AI Studio</p>
            <p className="text-zinc-600 text-sm mb-1">Jaipur, Rajasthan, India</p>
            <p className="text-zinc-600 text-sm">
              Email:{" "}
              <a href="mailto:deepak@graflystudio.com" className="text-black underline underline-offset-4 hover:text-zinc-600 transition-colors">
                deepak@graflystudio.com
              </a>
            </p>
          </div>

          <h2 className="font-sans font-bold tracking-[-0.05em] text-2xl mt-12 mb-4 text-black">Final Note</h2>
          <p className="mb-4 leading-relaxed">
            GROTON AI Studio is committed to building a creative production business where technology improves the way visual content is created without compromising responsible handling of client information and creative assets.
          </p>
          <p className="mb-8 leading-relaxed">
            We aim to keep our approach to privacy clear, practical, and transparent.
          </p>
        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
