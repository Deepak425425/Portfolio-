import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-24 md:py-32 w-full">
        <h1 className="font-serif text-4xl md:text-5xl mb-12 text-black">Terms & Conditions</h1>
        <div className="font-sans text-sm text-zinc-600 space-y-8 leading-relaxed">
          <section>
            <h2 className="text-black font-semibold uppercase tracking-wider text-xs mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using the PhotoLoom website, you accept and agree to be bound by the terms and provision of this agreement.</p>
          </section>
          <section>
            <h2 className="text-black font-semibold uppercase tracking-wider text-xs mb-4">2. Intellectual Property</h2>
            <p>The website and its original content, features, and functionality are owned by PhotoLoom (a venture by Grafly Studio) and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.</p>
          </section>
          <section>
            <h2 className="text-black font-semibold uppercase tracking-wider text-xs mb-4">3. Use License</h2>
            <p>Permission is granted to temporarily view the materials (information or software) on PhotoLoom's website for personal, non-commercial transitory viewing only.</p>
          </section>
          <section>
            <h2 className="text-black font-semibold uppercase tracking-wider text-xs mb-4">4. Disclaimer</h2>
            <p>The materials on PhotoLoom's website are provided on an 'as is' basis. PhotoLoom makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
