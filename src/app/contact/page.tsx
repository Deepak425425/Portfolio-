"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import CmsImage from "@/components/CmsImage";
import CmsText from "@/components/CmsText";




export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;
    
    // WHATSAPP CONFIGURATION
    const WHATSAPP_NUMBER = "916378083205"; // GROTON Contact Number
    
    const message = `NEW PROJECT INQUIRY

Name: ${data.name}
Brand / Company: ${data.brand}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}

Project Type:
${data.type}

Budget Range:
${data.budget}

Project Details:
${data.details}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    setIsSuccess(true);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] flex flex-col font-sans text-black selection:bg-black selection:text-white">
      {/* HEADER */}
      <Header />

      {/* CONTACT CONTENT */}
      <main className="flex-1 w-full flex flex-col lg:flex-row">
        
        <div className="w-full lg:w-1/2 p-6 md:p-12 lg:p-24 flex flex-col justify-center bg-[#F9F8F6] border-r border-[rgba(0,0,0,0.05)]">
          <div className="max-w-xl mx-auto lg:mx-0 w-full">
            <CmsText cmsId="contact.hero.heading" as="h1" className="font-sans font-bold tracking-[-0.05em] text-5xl md:text-6xl mb-6" fallback="Start a project." />
            <CmsText cmsId="contact.hero.desc" as="p" className="text-sm text-zinc-500 font-light mb-12 leading-relaxed" fallback="Tell us what you are building. Our creative team will review your requirements and reach out to discuss visual direction, timelines, and next steps." />

            <div className="flex flex-col sm:flex-row gap-8 mb-16 pb-12 border-b border-zinc-100">
              <div>
                <CmsText cmsId="contact.info.direct" as="h4" className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400 mb-2" fallback="Direct Contact" />
                <CmsText cmsId="contact.info.name" as="p" className="text-sm font-medium" fallback="Deepak Kumawat" />
                <a href="mailto:deepak@graflystudio.com" className="text-sm text-zinc-500 hover:text-black transition-colors block mt-1">deepak@graflystudio.com</a>
              </div>
              <div>
                <CmsText cmsId="contact.info.social" as="h4" className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400 mb-2" fallback="Socials & Direct Line" />
                <a href="https://wa.me/916378083205" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-500 hover:text-black transition-colors block">
                  <CmsText cmsId="contact.info.whatsapp" fallback="WhatsApp (+91 63780 83205)" />
                </a>
                <CmsText cmsId="contact.info.linkedin" fallback="LinkedIn" as="a" className="text-sm text-zinc-500 hover:text-black transition-colors block mt-1" href="https://www.linkedin.com/in/deepak-kumawat-grafly" target="_blank" rel="noopener noreferrer" />
              </div>
            </div>

            {isSuccess ? (
              <div className="bg-[#F9F8F6] border border-[rgba(0,0,0,0.05)] p-8 md:p-12 text-center animate-fade-in">
                <div className="w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                </div>
                <h3 className="font-sans font-bold tracking-[-0.05em] text-2xl mb-4 text-black">WhatsApp Opened</h3>
                <p className="text-sm text-zinc-500 font-light">WhatsApp opened with your inquiry details. Please review the message and press send.</p>
                <button onClick={() => setIsSuccess(false)} className="mt-8 text-[10px] uppercase tracking-widest font-bold border-b border-black pb-1 hover:text-zinc-500 transition-colors text-black">
                  Submit another project
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-600"><CmsText cmsId="contact.form.name.label" fallback="Name" /></label>
                    <input required type="text" id="name" name="name" className="border-b border-zinc-300 py-3 bg-transparent focus:outline-none focus:border-black transition-colors font-light text-sm" placeholder="Jane Doe" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="brand" className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-600"><CmsText cmsId="contact.form.brand.label" fallback="Brand / Company" /></label>
                    <input required type="text" id="brand" name="brand" className="border-b border-zinc-300 py-3 bg-transparent focus:outline-none focus:border-black transition-colors font-light text-sm" placeholder="Your Brand" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-600"><CmsText cmsId="contact.form.email.label" fallback="Email" /></label>
                    <input required type="email" id="email" name="email" className="border-b border-zinc-300 py-3 bg-transparent focus:outline-none focus:border-black transition-colors font-light text-sm" placeholder="jane@brand.com" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="phone" className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-600"><CmsText cmsId="contact.form.phone.label" fallback="Phone (Optional)" /></label>
                    <input type="tel" id="phone" name="phone" className="border-b border-zinc-300 py-3 bg-transparent focus:outline-none focus:border-black transition-colors font-light text-sm" placeholder="+1 234 567 890" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="type" className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-600"><CmsText cmsId="contact.form.type.label" fallback="Project Type" /></label>
                  <div className="relative">
                    <select required id="type" name="type" defaultValue="" className="w-full border-b border-zinc-300 py-3 bg-transparent focus:outline-none focus:border-black transition-colors font-light text-sm appearance-none rounded-none cursor-pointer">
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
                  <label htmlFor="budget" className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-600"><CmsText cmsId="contact.form.budget.label" fallback="Budget Range" /></label>
                  <div className="relative">
                    <select required id="budget" name="budget" defaultValue="" className="w-full border-b border-zinc-300 py-3 bg-transparent focus:outline-none focus:border-black transition-colors font-light text-sm appearance-none rounded-none cursor-pointer">
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
                  <label htmlFor="details" className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-600"><CmsText cmsId="contact.form.details.label" fallback="Project Details" /></label>
                  <textarea required id="details" name="details" rows={4} className="border-b border-zinc-300 py-3 bg-transparent focus:outline-none focus:border-black transition-colors font-light text-sm resize-none" placeholder="Tell us about the visual direction, quantity of assets, and timeline..."></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="mt-6 px-10 py-5 bg-black text-white text-xs uppercase tracking-[0.2em] font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center h-14"
                >
                  {isSubmitting ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    "SEND ON WHATSAPP"
                  )}
                </button>

                {errorMsg && (
                  <div className="mt-4 p-4 border border-red-200 bg-red-50 text-red-600 text-sm font-light text-center">
                    {errorMsg}
                  </div>
                )}
              </form>
            )}
          </div>
        </div>

        <div className="hidden lg:block lg:w-1/2 relative bg-zinc-100">
          <CmsImage cmsId="contact_visual" fallbackSrc="/campaign-worlds/groton-contact-visual-4x5.webp" alt="GROTON AI STUDIO" fill className="object-cover object-[center_15%]" />
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute bottom-16 left-16 max-w-sm">
            <CmsText cmsId="contact.hero.quote" as="h3" className="font-sans font-bold tracking-[-0.05em] text-3xl text-white mb-4" fallback={'"The visual standard for modern brands."'} />
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
