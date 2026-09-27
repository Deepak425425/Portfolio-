import Link from "next/link";

export default function Services() {
  return (
    <div className="relative min-h-[100svh] bg-background flex flex-col p-4 sm:p-6 md:p-8 lg:p-10">
      <main className="flex-1 max-w-[1400px] w-full mx-auto bg-white shadow-2xl flex flex-col relative overflow-hidden min-h-[85svh] rounded-sm">
        
        <header className="w-full p-5 sm:p-8 md:px-12 lg:px-16 lg:py-10 flex flex-row justify-between items-center z-20">
          <Link href="/" className="font-sans font-bold tracking-[0.3em] text-sm md:text-base uppercase text-black">
            PhotoLoom
          </Link>
          <div className="flex items-center gap-8">
            <a href="https://graflystudio.com" target="_blank" rel="noopener noreferrer" className="hidden md:block font-extrabold tracking-[0.3em] text-[15px] md:text-[17px] uppercase text-zinc-500 hover:text-black transition-colors font-sans">
              graflystudio.com
            </a>
          </div>
        </header>

        <div className="flex-1 flex flex-col px-6 md:px-16 lg:px-32 py-12 md:py-16 z-20 relative text-left">
          <h1 className="font-serif text-4xl md:text-5xl text-black mb-12">Services</h1>
          <ul className="max-w-3xl flex flex-col gap-8 w-full border-t border-zinc-100 pt-8">
            {['AI Product Images', 'AI Commercial Reels / Films', 'Product Advertising', 'Social Media Creatives', 'Creative Direction'].map((service, i) => (
              <li key={i} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-12 border-b border-zinc-100 pb-8">
                <span className="font-sans text-[10px] tracking-[0.2em] text-zinc-400 w-8">0{i+1}</span>
                <span className="font-serif text-xl md:text-2xl text-black flex-1">{service}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full p-5 sm:p-8 md:px-12 lg:px-16 flex flex-col items-center justify-between gap-6 z-20 mt-auto border-t border-zinc-100">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-[8px] sm:text-[10px] tracking-[0.2em] uppercase font-sans text-zinc-500">
            <Link href="/about" className="hover:text-black transition-colors">About</Link>
            <Link href="/services" className="hover:text-black transition-colors">Services</Link>
            <Link href="/work" className="hover:text-black transition-colors">Work</Link>
            <Link href="/contact" className="hover:text-black transition-colors">Contact</Link>
            <Link href="/privacy-policy" className="hover:text-black transition-colors">Privacy Policy</Link>
            <Link href="/terms-and-conditions" className="hover:text-black transition-colors">Terms & Conditions</Link>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 text-center">
            <p className="text-[9px] sm:text-[10px] text-zinc-400 tracking-[0.15em] sm:tracking-[0.2em] uppercase font-sans">
              &copy; 2026 PhotoLoom
            </p>
            <p className="text-[9px] sm:text-[10px] text-zinc-400 tracking-[0.15em] sm:tracking-[0.2em] uppercase font-sans">
              A creative venture by Grafly Studio
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
