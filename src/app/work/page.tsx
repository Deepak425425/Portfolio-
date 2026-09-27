import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Work() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-6 py-24 md:py-32 w-full">
        <h1 className="font-serif text-4xl md:text-6xl mb-16">Selected Work</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          <div className="aspect-[3/4] bg-zinc-100/50 border border-zinc-200 w-full flex items-center justify-center">
            <span className="font-sans text-[10px] tracking-[0.2em] text-zinc-400 uppercase">Curation In Progress</span>
          </div>
          <div className="aspect-[4/5] bg-zinc-100/50 border border-zinc-200 w-full mt-0 md:mt-24 flex items-center justify-center">
            <span className="font-sans text-[10px] tracking-[0.2em] text-zinc-400 uppercase">Curation In Progress</span>
          </div>
          <div className="aspect-[4/5] bg-zinc-100/50 border border-zinc-200 w-full flex items-center justify-center">
             <span className="font-sans text-[10px] tracking-[0.2em] text-zinc-400 uppercase">Curation In Progress</span>
          </div>
          <div className="aspect-[3/4] bg-zinc-100/50 border border-zinc-200 w-full mt-0 md:mt-16 flex items-center justify-center">
            <span className="font-sans text-[10px] tracking-[0.2em] text-zinc-400 uppercase">Curation In Progress</span>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
