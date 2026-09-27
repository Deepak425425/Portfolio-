import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Contact() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-6 py-24 md:py-32 w-full flex flex-col items-center justify-center text-center">
        <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-500 mb-8">Connect</span>
        <h1 className="font-serif text-4xl md:text-6xl mb-8 text-black">Let's create something together.</h1>
        <a href="mailto:hello@graflystudio.com" className="font-sans text-lg md:text-xl text-black hover:italic transition-all duration-300 border-b border-black pb-1">
          hello@graflystudio.com
        </a>
      </main>
      <Footer />
    </div>
  );
}
