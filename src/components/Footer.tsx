import React from "react";
import Link from "next/link";
import CmsText from "@/components/CmsText";

export default function Footer() {
  return (
    <footer className="relative w-full bg-[#F9F8F6] border-t border-[rgba(0,0,0,0.05)] mt-auto overflow-hidden">
      {/* Subtle grid pattern background matching Homepage master */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-6 sm:px-8 md:px-12 lg:px-16 pt-6 sm:pt-7 md:pt-8 pb-4 sm:pb-5 flex flex-col relative z-10">
        {/* BRAND ROW */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-5 sm:mb-6 md:mb-6">
          <Link href="/" className="inline-block">
            <CmsText 
              cmsId="global.footer.brand" 
              as="h3" 
              className="font-sans font-bold tracking-[0.3em] text-xl md:text-2xl uppercase text-black hover:opacity-80 transition-opacity" 
              fallback="GROTON AI STUDIO" 
            />
          </Link>
        </div>

        {/* 4 BALANCED COLUMNS: SERVICES | COMPANY | TOOLS | CONNECT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-8 md:gap-8 lg:gap-12 items-start h-fit">
          {/* COLUMN 01 — SERVICES */}
          <div className="flex flex-col h-fit self-start md:col-start-3">
            <span className="text-[10px] md:text-[11px] tracking-[0.25em] uppercase font-bold text-black mb-4">
              SERVICES
            </span>
            <div className="flex flex-col gap-3 text-[11px] md:text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500">
              <Link 
                href="/services#ecommerce-pdp" 
                className="hover:text-black transition-colors py-0.5"
              >
                E-commerce & PDP
              </Link>
              <Link 
                href="/services#product-on-model" 
                className="hover:text-black transition-colors py-0.5"
              >
                Product-on-Model
              </Link>
              <Link 
                href="/services#lifestyle-editorial" 
                className="hover:text-black transition-colors py-0.5"
              >
                Lifestyle & Editorial
              </Link>
              <Link 
                href="/services#campaign-advertising" 
                className="hover:text-black transition-colors py-0.5"
              >
                Campaign & Advertising
              </Link>
            </div>
          </div>

          {/* COLUMN 02 — COMPANY */}
          <div className="flex flex-col h-fit self-start">
            <span className="text-[10px] md:text-[11px] tracking-[0.25em] uppercase font-bold text-black mb-4">
              COMPANY
            </span>
            <div className="flex flex-col gap-3 text-[11px] md:text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500">
              <Link 
                href="/about" 
                className="hover:text-black transition-colors py-0.5"
              >
                About
              </Link>
              <Link 
                href="/team" 
                className="hover:text-black transition-colors py-0.5"
              >
                Team
              </Link>
              <Link 
                href="/work" 
                className="hover:text-black transition-colors py-0.5"
              >
                Work
              </Link>
              <Link 
                href="/blog" 
                className="hover:text-black transition-colors py-0.5"
              >
                Insights
              </Link>
              <Link 
                href="/pricing" 
                className="hover:text-black transition-colors py-0.5"
              >
                Pricing
              </Link>
              <Link 
                href="/contact" 
                className="hover:text-black transition-colors py-0.5"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* COLUMN 03 — TOOLS */}
          <div className="flex flex-col h-fit self-start">
            <span className="text-[10px] md:text-[11px] tracking-[0.25em] uppercase font-bold text-black mb-4">
              TOOLS
            </span>
            <div className="flex flex-col gap-3 text-[11px] md:text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500">
              <Link 
                href="/tools#image-tools" 
                className="hover:text-black transition-colors py-0.5"
              >
                Image Tools
              </Link>
              <Link 
                href="/tools" 
                className="hover:text-black transition-colors py-0.5"
              >
                All Tools
              </Link>
            </div>
          </div>

          {/* COLUMN 04 — CONNECT */}
          <div className="flex flex-col h-fit self-start">
            <span className="text-[10px] md:text-[11px] tracking-[0.25em] uppercase font-bold text-black mb-4">
              CONNECT
            </span>
            <div className="flex flex-col gap-3 text-[11px] md:text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500">
              <a 
                href="https://wa.me/916378083205" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-black transition-colors py-0.5 inline-flex items-center gap-1.5"
              >
                WhatsApp
              </a>
              <a 
                href="https://www.instagram.com/d99p4k/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-black transition-colors py-0.5 inline-flex items-center gap-1.5"
              >
                Instagram
              </a>
              <a 
                href="https://in.linkedin.com/in/deepak-kumawat-grafly" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-black transition-colors py-0.5 inline-flex items-center gap-1.5"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        {/* LEGAL / BOTTOM ROW */}
        <div className="mt-3 pt-3 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 text-[10px] tracking-[0.2em] uppercase font-bold">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 text-zinc-400">
            <CmsText cmsId="global.footer.copyright" as="p" fallback="© 2026 GROTON AI STUDIO" />
            <div className="flex items-center gap-4 sm:gap-6">
              <Link href="/privacy-policy" className="hover:text-black transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-and-conditions" className="hover:text-black transition-colors">
                Terms & Conditions
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <a 
              href="https://www.instagram.com/d99p4k/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-inherit opacity-60 hover:opacity-100 transition-all duration-300 hover:-translate-y-1" 
              aria-label="Instagram"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
              </svg>
            </a>
            <a 
              href="https://in.linkedin.com/in/deepak-kumawat-grafly" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-inherit opacity-60 hover:opacity-100 hover:text-[#0a66c2] transition-all duration-300 hover:-translate-y-1" 
              aria-label="LinkedIn"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
              </svg>
            </a>
          </div>

          <p className="text-[10px] text-zinc-400 tracking-[0.2em] uppercase font-bold">
            <CmsText cmsId="global.footer.credit" fallback="A creative venture by" />{" "}
            <a 
              href="https://graflystudio.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-zinc-600 hover:text-black transition-colors"
            >
              <CmsText cmsId="global.footer.creditLink" fallback="Grafly Studio" />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}