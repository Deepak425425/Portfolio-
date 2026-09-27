import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full p-8 md:px-16 md:py-12 flex flex-col md:flex-row justify-between items-center text-center gap-8 border-t border-zinc-200 mt-auto bg-white z-20">
      <div className="flex flex-wrap justify-center gap-6 text-[10px] tracking-[0.2em] uppercase font-sans text-zinc-500">
        <Link href="/about" className="hover:text-black transition-colors">About</Link>
        <Link href="/services" className="hover:text-black transition-colors">Services</Link>
        <Link href="/work" className="hover:text-black transition-colors">Work</Link>
        <Link href="/contact" className="hover:text-black transition-colors">Contact</Link>
        <Link href="/privacy-policy" className="hover:text-black transition-colors">Privacy Policy</Link>
        <Link href="/terms-and-conditions" className="hover:text-black transition-colors">Terms & Conditions</Link>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <p className="text-[10px] text-zinc-400 tracking-[0.2em] uppercase font-sans">
          &copy; 2026 PhotoLoom
        </p>
        <span className="hidden sm:inline text-zinc-300">|</span>
        <p className="text-[10px] text-zinc-400 tracking-[0.2em] uppercase font-sans">
          A creative venture by Grafly Studio
        </p>
      </div>
    </footer>
  );
}
