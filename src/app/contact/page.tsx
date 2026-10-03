"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import CmsImage from "@/components/CmsImage";
import CmsText from "@/components/CmsText";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate network request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

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
            <Link href="/tools" className="hover:text-black transition-colors">Tools</Link>
            <Link href="/about" className="hover:text-black transition-colors">About</Link>
          </nav>
          <Link href="/contact" className="px-5 py-3 bg-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors">
            Contact
          </Link>
        </div>
      </header>

      {/* CONTACT CONTENT */}
      <main className="flex-1 w-full flex flex-col lg:flex-row">
        
        <div className="w-full lg:w-1/2 p-6 md:p-12 lg:p-24 flex flex-col justify-center bg-white border-r border-zinc-200">
          <div className="max-w-xl mx-auto lg:mx-0 w-full">
            <CmsText cmsId="contact_hero_heading" as="h1" className="font-serif text-5xl md:text-6xl mb-6" fallback="Start a project." />
            <CmsText cmsId="contact_hero_desc" as="p" className="text-sm text-zinc-500 font-light mb-12 leading-relaxed" fallback="Tell us what you are building. Our creative team will review your requirements and reach out to discuss visual direction, timelines, and next steps." />

            <div className="flex flex-col sm:flex-row gap-8 mb-16 pb-12 border-b border-zinc-100">
              <div>
                <h4 className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400 mb-2">Direct Contact</h4>
                <p className="text-sm font-medium">Deepak Kumawat</p>
                <a href="mailto:deepak@graflystudio.com" className="text-sm text-zinc-500 hover:text-black transition-colors block mt-1">deepak@graflystudio.com</a>
              </div>
              <div>
                <h4 className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400 mb-2">Socials & Direct Line</h4>
                <a href="https://wa.me/916378083205" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-500 hover:text-black transition-colors block">WhatsApp (+91 63780 83205)</a>
                <a href="https://www.linkedin.com/in/deepak-kumawat-grafly" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-500 hover:text-black transition-colors block mt-1">LinkedIn</a>
              </div>
            </div>

            {isSuccess ? (
              <div className="bg-zinc-50 border border-zinc-200 p-8 md:p-12 text-center animate-fade-in">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="font-serif text-2xl mb-4">Inquiry Received</h3>
                <p className="text-sm text-zinc-500 font-light">
                  Thank you for reaching out. A creative director will review your project details and get back to you within 24 hours.
                </p>
                <button onClick={() => setIsSuccess(false)} className="mt-8 text-[10px] uppercase tracking-widest font-bold border-b border-black pb-1 hover:text-zinc-500 transition-colors">
                  Submit another project
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-600">Name</label>
                    <input required type="text" id="name" className="border-b border-zinc-300 py-3 bg-transparent focus:outline-none focus:border-black transition-colors font-light text-sm" placeholder="Jane Doe" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="brand" className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-600">Brand / Company</label>
                    <input required type="text" id="brand" className="border-b border-zinc-300 py-3 bg-transparent focus:outline-none focus:border-black transition-colors font-light text-sm" placeholder="Your Brand" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-600">Email</label>
                    <input required type="email" id="email" className="border-b border-zinc-300 py-3 bg-transparent focus:outline-none focus:border-black transition-colors font-light text-sm" placeholder="jane@brand.com" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="phone" className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-600">Phone (Optional)</label>
                    <input type="tel" id="phone" className="border-b border-zinc-300 py-3 bg-transparent focus:outline-none focus:border-black transition-colors font-light text-sm" placeholder="+1 234 567 890" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="type" className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-600">Project Type</label>
                  <div className="relative">
                    <select required id="type" defaultValue="" className="w-full border-b border-zinc-300 py-3 bg-transparent focus:outline-none focus:border-black transition-colors font-light text-sm appearance-none rounded-none cursor-pointer">
                      <option value="" disabled>Select a service...</option>
                      <option value="AI Product Images">AI Product Images</option>
                      <option value="Product-on-Model">Product-on-Model</option>
                      <option value="Lifestyle Product Imagery">Lifestyle Product Imagery</option>
                      <option value="Campaign Visuals">Campaign Visuals</option>
                      <option value="Catalog & Marketplace Imagery">Catalog & Marketplace Imagery</option>
                      <option value="Social Media Content">Social Media Content</option>
                      <option value="Creative Direction">Creative Direction</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="budget" className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-600">Budget Range</label>
                  <div className="relative">
                    <select required id="budget" defaultValue="" className="w-full border-b border-zinc-300 py-3 bg-transparent focus:outline-none focus:border-black transition-colors font-light text-sm appearance-none rounded-none cursor-pointer">
                      <option value="" disabled>Select a range...</option>
                      <option value="Starter">Starter — 25 Images — ₹2,499+</option>
                      <option value="Growth">Growth — 50 Images — ₹4,499+</option>
                      <option value="Scale">Scale — 100 Images — ₹7,999+</option>
                      <option value="Custom">Custom / Not Sure</option>
                    </select>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="details" className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-600">Project Details</label>
                  <textarea required id="details" rows={4} className="border-b border-zinc-300 py-3 bg-transparent focus:outline-none focus:border-black transition-colors font-light text-sm resize-none" placeholder="Tell us about the visual direction, quantity of assets, and timeline..."></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="mt-6 px-10 py-5 bg-black text-white text-xs uppercase tracking-[0.2em] font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center h-14"
                >
                  {isSubmitting ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    "Submit Inquiry"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="hidden lg:block lg:w-1/2 relative bg-zinc-100">
          <CmsImage cmsId="contact_visual" fallbackSrc="/campaign-worlds/High-Angle Editorial Fashion Portrait (1).jpeg" alt="GROTON AI STUDIO" fill className="object-cover object-[center_15%]" />
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute bottom-16 left-16 max-w-sm">
            <h3 className="font-serif text-3xl text-white mb-4">"The visual standard for modern brands."</h3>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-white border-t border-zinc-200">
        <div className="max-w-[1400px] mx-auto p-8 md:p-16 flex flex-col gap-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
            <h3 className="font-sans font-bold tracking-[0.3em] text-xl md:text-2xl uppercase text-black">GROTON AI STUDIO</h3>
            <div className="flex flex-wrap gap-x-8 gap-y-4 text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500">
              <Link href="/about" className="hover:text-black transition-colors">About</Link>
              <Link href="/services" className="hover:text-black transition-colors">Services</Link>
              <Link href="/work" className="hover:text-black transition-colors">Work</Link>
              <Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link>
              <Link href="/contact" className="text-black transition-colors">Contact</Link>
              <Link href="/privacy-policy" className="hover:text-black transition-colors">Privacy Policy</Link>
              <Link href="/terms-and-conditions" className="hover:text-black transition-colors">Terms & Conditions</Link>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-8 border-t border-zinc-100">
            <p className="text-[10px] text-zinc-400 tracking-[0.2em] uppercase font-bold">
              &copy; 2026 GROTON AI STUDIO
            </p>
            <div className="flex items-center gap-6">
              <a href="https://www.instagram.com/d99p4k/" target="_blank" rel="noopener noreferrer" className="text-inherit opacity-60 hover:opacity-100 transition-all duration-300 hover:-translate-y-1" aria-label="Instagram">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://in.linkedin.com/in/deepak-kumawat-grafly" target="_blank" rel="noopener noreferrer" className="text-inherit opacity-60 hover:opacity-100 hover:text-[#0a66c2] transition-all duration-300 hover:-translate-y-1" aria-label="LinkedIn">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
            <p className="text-[10px] text-zinc-400 tracking-[0.2em] uppercase font-bold">
              A creative venture by <a href="https://graflystudio.com" target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-black transition-colors">Grafly Studio</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
