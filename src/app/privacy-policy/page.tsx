import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-24 md:py-32 w-full">
        <h1 className="font-serif text-4xl md:text-5xl mb-12 text-black">Privacy Policy</h1>
        <div className="font-sans text-sm text-zinc-600 space-y-8 leading-relaxed">
          <section>
            <h2 className="text-black font-semibold uppercase tracking-wider text-xs mb-4">1. Introduction</h2>
            <p>Welcome to PhotoLoom. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website.</p>
          </section>
          <section>
            <h2 className="text-black font-semibold uppercase tracking-wider text-xs mb-4">2. The Data We Collect</h2>
            <p>We may collect, use, store and transfer different kinds of personal data about you which you provide to us directly, such as when you contact us via email.</p>
          </section>
          <section>
            <h2 className="text-black font-semibold uppercase tracking-wider text-xs mb-4">3. How We Use Your Data</h2>
            <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data to respond to your inquiries and provide you with our services.</p>
          </section>
          <section>
            <h2 className="text-black font-semibold uppercase tracking-wider text-xs mb-4">4. Contact Details</h2>
            <p>If you have any questions about this privacy policy or our privacy practices, please contact us at hello@graflystudio.com.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
