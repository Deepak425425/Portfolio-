import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full p-6 md:px-16 md:py-10 flex flex-row justify-between items-center z-50 bg-white border-b border-zinc-100">
      <Link href="/" className="font-sans font-bold tracking-[0.3em] text-sm md:text-base uppercase text-black">
        PhotoLoom
      </Link>
      <nav className="hidden md:flex gap-8 font-sans text-[11px] tracking-[0.2em] uppercase font-medium">
        <Link href="/work" className="text-zinc-500 hover:text-black transition-colors">Work</Link>
        <Link href="/services" className="text-zinc-500 hover:text-black transition-colors">Services</Link>
        <Link href="/about" className="text-zinc-500 hover:text-black transition-colors">About</Link>
        <Link href="/contact" className="text-zinc-500 hover:text-black transition-colors">Contact</Link>
      </nav>
      <div className="flex items-center gap-8">
        <a href="https://graflystudio.com" target="_blank" rel="noopener noreferrer" className="hidden lg:block font-extrabold tracking-[0.3em] text-[13px] uppercase text-zinc-400 hover:text-black transition-colors font-sans">
          graflystudio.com
        </a>
        <button className="flex md:hidden flex-col gap-[6px] p-2 hover:opacity-60 transition-opacity" aria-label="Menu">
          <span className="w-8 h-[2px] bg-black block"></span>
          <span className="w-8 h-[2px] bg-black block"></span>
        </button>
      </div>
    </header>
  );
}
