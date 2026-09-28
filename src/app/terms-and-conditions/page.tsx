import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions — GROTON AI STUDIO",
  description: "GROTON terms of service and usage conditions.",
};

export default function TermsPage() {
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
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6">Terms & Conditions</h1>
          <p className="text-sm text-zinc-500 font-light">Last updated: [DATE_PLACEHOLDER]</p>
        </div>

        <div className="prose prose-zinc prose-p:font-light prose-p:text-zinc-600 max-w-none">
          <p>
            {/* TODO: Legal Review Required - Replace placeholders with actual business entities before publishing */}
            Please read these Terms and Conditions ("Terms", "Terms and Conditions") carefully before using the GROTON website operated by GROTON AI STUDIO.
          </p>

          <h3 className="font-serif text-2xl mt-12 mb-4">1. Acceptance of Terms</h3>
          <p>
            By accessing or using our website and services, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the service.
          </p>

          <h3 className="font-serif text-2xl mt-12 mb-4">2. Creative Services and AI Production</h3>
          <p>
            GROTON provides AI-assisted visual production and creative direction services. Deliverables, revisions, and project timelines are subject to the specific Statement of Work (SOW) or project agreement established between GROTON and the client prior to project commencement.
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-4 font-light text-zinc-600 text-sm">
            <li>Visual outputs are generated using artificial intelligence guided by human art direction.</li>
            <li>Due to the nature of generative AI, exact pixel-for-pixel replication of references is not guaranteed unless specified in composite retouching phases.</li>
            <li>Pricing listed on the website is indicative; final pricing is determined by the project scope.</li>
          </ul>

          <h3 className="font-serif text-2xl mt-12 mb-4">3. Intellectual Property Rights</h3>
          <p>
            Upon full payment of the agreed project fees, clients receive commercial usage rights to the final delivered visual assets as outlined in their specific contract. GROTON retains the right to display the created assets in our portfolio, case studies, and marketing materials unless a Non-Disclosure Agreement (NDA) is signed prior to commencement.
          </p>

          <h3 className="font-serif text-2xl mt-12 mb-4">4. Limitation of Liability</h3>
          <p>
            In no event shall GROTON, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>

          <h3 className="font-serif text-2xl mt-12 mb-4">5. Governing Law</h3>
          <p>
            These Terms shall be governed and construed in accordance with the laws of [JURISDICTION_PLACEHOLDER], without regard to its conflict of law provisions.
          </p>
          
          <h3 className="font-serif text-2xl mt-12 mb-4">6. Contact Us</h3>
          <p>
            If you have any questions about these Terms, please contact us at:
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
              <Link href="/privacy-policy" className="hover:text-black transition-colors">Privacy Policy</Link>
              <Link href="/terms-and-conditions" className="text-black transition-colors">Terms & Conditions</Link>
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
