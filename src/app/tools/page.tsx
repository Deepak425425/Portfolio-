"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const toolsList = [
  {
    id: "grid-cutter",
    name: "Grid Cutter",
    description: "Split one image into multiple equal grid panels.",
    href: "/tools/grid-cutter",
    status: "Active"
  },
  {
    id: "watermark",
    name: "Watermark",
    description: "Add text or logo watermarks to images.",
    href: "#",
    status: "Coming Soon"
  },
  {
    id: "face-blur",
    name: "Face Blur",
    description: "Blur or pixelate faces in images.",
    href: "#",
    status: "Coming Soon"
  },
  {
    id: "image-resize",
    name: "Image Resize",
    description: "Resize images individually or in bulk.",
    href: "#",
    status: "Coming Soon"
  },
  {
    id: "image-compressor",
    name: "Image Compressor",
    description: "Compress images while controlling quality.",
    href: "#",
    status: "Coming Soon"
  },
  {
    id: "format-converter",
    name: "Format Converter",
    description: "Convert JPG, PNG and WebP.",
    href: "#",
    status: "Coming Soon"
  },
  {
    id: "background-remover",
    name: "Background Remover",
    description: "Remove image backgrounds.",
    href: "#",
    status: "Coming Soon"
  },
  {
    id: "pdf-contact-sheet",
    name: "PDF Contact Sheet",
    description: "Create a PDF from multiple images.",
    href: "#",
    status: "Coming Soon"
  }
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans text-black selection:bg-black selection:text-white">
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
            <Link href="/tools" className="text-black transition-colors">Tools</Link>
            <Link href="/about" className="hover:text-black transition-colors">About</Link>
          </nav>
          <Link href="/contact" className="px-5 py-3 bg-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors">
            Contact
          </Link>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 w-full flex flex-col items-center pt-24 md:pt-32 pb-24 px-6 md:px-12 lg:px-24 bg-zinc-50">
        <div className="w-full max-w-[1400px] flex flex-col items-start justify-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl tracking-tight text-black mb-6">TOOLS</h1>
            <p className="font-sans font-light text-zinc-500 text-base md:text-lg max-w-lg mb-16">
              Practical image tools for faster creative production.
            </p>
          </motion.div>

          <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
            {toolsList.map((tool, index) => {
              const isActive = tool.status === "Active";
              return (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 * index, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link 
                    href={isActive ? tool.href : "#"} 
                    className={`group relative flex flex-col w-full h-full p-8 md:p-10 border transition-all duration-500 ${
                      isActive 
                        ? "bg-white border-zinc-200 hover:border-black hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] cursor-pointer" 
                        : "bg-transparent border-zinc-200/50 cursor-default"
                    }`}
                  >
                    <div className="flex flex-row justify-between items-start mb-16">
                      <h2 className={`font-serif text-2xl md:text-3xl tracking-tight transition-colors ${isActive ? "text-black" : "text-zinc-400"}`}>
                        {tool.name}
                      </h2>
                      {!isActive && (
                        <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400 bg-zinc-100 px-3 py-1 rounded-sm">
                          Coming Soon
                        </span>
                      )}
                      {isActive && (
                        <span className="text-black opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </span>
                      )}
                    </div>
                    <p className={`font-sans font-light text-sm md:text-base leading-relaxed ${isActive ? "text-zinc-500" : "text-zinc-400"}`}>
                      {tool.description}
                    </p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
