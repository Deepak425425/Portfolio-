import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — GROTON AI STUDIO",
  description: "GROTON privacy policy and data usage terms.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-black selection:bg-black selection:text-white">
      {/* HEADER */}
      <header className="w-full p-6 md:px-12 lg:px-24 flex flex-row justify-between items-center z-30 bg-white border-b border-zinc-200">
        <Link href="/" className="font-sans font-bold tracking-[0.3em] text-sm md:text-base uppercase text-black">
          GROTON AI STUDIO
        </Link>
        <div className="flex items-center gap-8">
          <nav className="hidden lg:flex items-center gap-8 text-[11px] font-bold tracking-[0.2em] uppercase text-zinc-400">
            <Link href="/work" className="hover:text-black transition-colors">Work</Link>
            <Link href="/services" className="hover:text-black transition-colors">Services</Link>
            <Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link>
            <Link href="/about" className="hover:text-black transition-colors">About</Link>
          </nav>
          <Link href="/contact" className="px-5 py-3 bg-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors">
            Contact
          </Link>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 w-full flex flex-col py-24 md:py-32 px-6 md:px-12 lg:px-24 max-w-4xl mx-auto">
        <div className="mb-16 border-b border-zinc-200 pb-12">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6">Privacy Policy</h1>
          <p className="text-sm text-zinc-500 font-light">Last updated: [DATE_PLACEHOLDER]</p>
        </div>

        <div className="prose prose-zinc prose-p:font-light prose-p:text-zinc-600 max-w-none">
          <p>
            {/* TODO: Legal Review Required - Replace placeholders with actual business entities before publishing */}
            At GROTON ("we", "our", or "us"), we are committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by GROTON.
          </p>

          <h3 className="font-serif text-2xl mt-12 mb-4">1. Information We Collect</h3>
          <p>
            We collect information that you provide directly to us when you use our website, fill out a contact form, request a quote, or communicate with us. This may include:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-4 font-light text-zinc-600 text-sm">
            <li>Name and contact information (email address, phone number).</li>
            <li>Company or brand information.</li>
            <li>Details regarding your visual production projects and budget constraints.</li>
            <li>Any other information you choose to provide.</li>
          </ul>

          <h3 className="font-serif text-2xl mt-12 mb-4">2. How We Use Your Information</h3>
          <p>
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-4 font-light text-zinc-600 text-sm">
            <li>Respond to your inquiries and provide creative proposals.</li>
            <li>Deliver our visual production and art direction services.</li>
            <li>Improve our website, services, and client communications.</li>
            <li>Send administrative information, such as updates to our terms or policies.</li>
          </ul>

          <h3 className="font-serif text-2xl mt-12 mb-4">3. Data Sharing and Disclosure</h3>
          <p>
            We do not sell, trade, or otherwise transfer your personal identifiable information to outside parties. This does not include trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.
            <br/><br/>
            Specifically, we may share data with:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-4 font-light text-zinc-600 text-sm">
            <li>[ANALYTICS_PROVIDER_PLACEHOLDER] for website analytics.</li>
            <li>[HOSTING_PROVIDER_PLACEHOLDER] for infrastructure.</li>
            <li>[CRM_PROVIDER_PLACEHOLDER] for client relationship management.</li>
          </ul>

          <h3 className="font-serif text-2xl mt-12 mb-4">4. Intellectual Property & Visual Generation</h3>
          <p>
            Any visual assets, brand guidelines, or product images you upload or share with us for the purpose of AI visual generation remain your intellectual property. We only use these assets to fulfill the creative brief and do not use them to train public AI models without explicit consent.
          </p>

          <h3 className="font-serif text-2xl mt-12 mb-4">5. Contact Us</h3>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
            <br/><br/>
            <strong>GROTON AI STUDIO</strong><br/>
            Email: [EMAIL_PLACEHOLDER]<br/>
            Address: [ADDRESS_PLACEHOLDER]
          </p>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-white border-t border-zinc-200 mt-auto">
        <div className="max-w-[1400px] mx-auto p-8 md:p-16 flex flex-col gap-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
            <h3 className="font-sans font-bold tracking-[0.3em] text-xl md:text-2xl uppercase text-black">GROTON AI STUDIO</h3>
            <div className="flex flex-wrap gap-x-8 gap-y-4 text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500">
              <Link href="/about" className="hover:text-black transition-colors">About</Link>
              <Link href="/services" className="hover:text-black transition-colors">Services</Link>
              <Link href="/work" className="hover:text-black transition-colors">Work</Link>
              <Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link>
              <Link href="/contact" className="hover:text-black transition-colors">Contact</Link>
              <Link href="/privacy-policy" className="text-black transition-colors">Privacy Policy</Link>
              <Link href="/terms-and-conditions" className="hover:text-black transition-colors">Terms & Conditions</Link>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-8 border-t border-zinc-100">
            <p className="text-[10px] text-zinc-400 tracking-[0.2em] uppercase font-bold">
              &copy; 2026 GROTON AI STUDIO
            </p>
            <p className="text-[10px] text-zinc-400 tracking-[0.2em] uppercase font-bold">
              A creative venture by <a href="https://graflystudio.com" target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-black transition-colors">Grafly Studio</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
