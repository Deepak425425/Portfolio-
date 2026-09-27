import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function About() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-6 py-24 md:py-32 w-full">
        <h1 className="font-serif text-4xl md:text-6xl mb-12">About PhotoLoom</h1>
        <div className="font-sans text-sm md:text-base text-zinc-600 space-y-8 leading-relaxed max-w-3xl">
          <p>
            PhotoLoom is an AI-powered visual production studio for modern brands. We merge the precision of traditional art direction with the limitless possibilities of artificial intelligence.
          </p>
          <p>
            We create cinematic imagery, campaigns, and visual systems that elevate brand perception, ensuring every visual artifact is premium, minimal, and highly art-directed.
          </p>
          <p>
            Our approach is rooted in understanding brand essence and formulating a distinct aesthetic direction before executing high-fidelity visual generation and meticulous post-production.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
