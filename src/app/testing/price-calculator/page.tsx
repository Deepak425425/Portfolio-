"use client";
import React, { useState, useEffect, useRef } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Link from "next/link";
import jsPDF from "jspdf";

const PACKAGES = [
  { id: "starter", name: "STARTER", images: 25, price: 2499, label: "₹2,499+" },
  { id: "growth", name: "GROWTH", images: 50, price: 4499, label: "₹4,499+", recommended: true },
  { id: "scale", name: "SCALE", images: 100, price: 7999, label: "₹7,999+" },
  { id: "custom", name: "CUSTOM", images: "Custom", price: null, label: "Custom Quote" },
];

const SERVICES = [
  "AI Product Images",
  "Product-on-Model",
  "Lifestyle Product Imagery",
  "Campaign Visuals",
  "Catalog & Marketplace Imagery",
  "Social Media Content",
  "Creative Direction",
  "Other"
];

const CUSTOM_QUOTE_SERVICES = [
  "Product-on-Model",
  "Lifestyle Product Imagery",
  "Campaign Visuals",
  "Creative Direction",
  "Other"
];

export default function PriceCalculatorPage() {
  const [selectedPackageId, setSelectedPackageId] = useState("growth");
  const [service, setService] = useState("AI Product Images");
  const [customImageCount, setCustomImageCount] = useState<number | string>(150);
  
  // Client details
  const [clientName, setClientName] = useState("");
  const [clientBrand, setClientBrand] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  const selectedPackage = PACKAGES.find(p => p.id === selectedPackageId)!;
  const isCustomPackage = selectedPackage.id === "custom";
  const imageCount = isCustomPackage ? customImageCount : selectedPackage.images;
  
  const requiresCustomQuote = isCustomPackage || CUSTOM_QUOTE_SERVICES.includes(service);
  const estimatedTotal = requiresCustomQuote ? "Custom Quote" : selectedPackage.label;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ format: "a4", unit: "mm" });
    const margin = 20;
    
    // Header
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("GROTON AI", margin, 30);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("PROJECT ESTIMATE", margin, 40);
    
    // Line
    doc.setLineWidth(0.5);
    doc.line(margin, 45, 190, 45);

    // Client Details
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("CLIENT:", margin, 55);
    doc.setFont("helvetica", "normal");
    doc.text(`${clientName || "Not provided"}`, margin + 30, 55);
    if (clientBrand) doc.text(`${clientBrand}`, margin + 30, 60);
    if (clientEmail) doc.text(`${clientEmail}`, margin + 30, 65);
    
    // Project Details
    doc.setFont("helvetica", "bold");
    doc.text("SERVICE:", margin, 80);
    doc.setFont("helvetica", "normal");
    doc.text(service, margin + 40, 80);

    doc.setFont("helvetica", "bold");
    doc.text("PACKAGE:", margin, 90);
    doc.setFont("helvetica", "normal");
    doc.text(selectedPackage.name, margin + 40, 90);

    doc.setFont("helvetica", "bold");
    doc.text("IMAGES:", margin, 100);
    doc.setFont("helvetica", "normal");
    doc.text(`${imageCount}`, margin + 40, 100);

    // Line
    doc.line(margin, 110, 190, 110);

    // Pricing
    doc.setFont("helvetica", "bold");
    doc.text("BASE PACKAGE:", margin, 125);
    doc.setFont("helvetica", "normal");
    doc.text(isCustomPackage ? "Custom Quote" : selectedPackage.label, 190, 125, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.text("ADDITIONAL SERVICES:", margin, 135);
    doc.setFont("helvetica", "normal");
    doc.text(CUSTOM_QUOTE_SERVICES.includes(service) ? "Custom Quote" : "None", 190, 135, { align: "right" });

    // Total
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("ESTIMATED TOTAL:", margin, 155);
    doc.text(estimatedTotal, 190, 155, { align: "right" });

    // Footer note
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    const note = "Pricing applies to standard e-commerce/product imagery. Product-on-model, lifestyle, advanced compositing and campaign visuals are quoted separately.";
    const splitNote = doc.splitTextToSize(note, 170);
    doc.text(splitNote, margin, 180);
    
    doc.text("GROTON.IN", margin, 200);

    const filename = clientBrand ? `${clientBrand.toLowerCase().replace(/\s+/g, '-')}-groton-quotation.pdf` : "groton-quotation.pdf";
    doc.save(filename);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] flex flex-col font-sans text-black selection:bg-[#8B7CFF] selection:text-white">
      <Navigation />
      
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="mb-16 print:hidden">
          <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500 mb-4 block">GROTON AI STUDIO</span>
          <h1 className="font-serif text-4xl md:text-6xl tracking-tight leading-tight mb-6">
            Price Calculator.
          </h1>
          <p className="text-zinc-500 max-w-xl text-sm md:text-base leading-relaxed">
            Estimate your visual production cost. Select your requirements below to generate a live quotation sheet.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 print:block">
          
          {/* LEFT: CONTROLS */}
          <div className="lg:col-span-7 flex flex-col gap-12 print:hidden">
            
            <section className="flex flex-col gap-6">
              <h2 className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">SELECT A PACKAGE</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PACKAGES.map(pkg => (
                  <button 
                    key={pkg.id}
                    onClick={() => setSelectedPackageId(pkg.id)}
                    className={`relative flex flex-col items-start p-6 border transition-all text-left ${selectedPackageId === pkg.id ? 'border-foreground bg-[#F9F8F6]' : 'border-[rgba(0,0,0,0.05)] hover:border-zinc-300'}`}
                  >
                    {pkg.recommended && (
                      <span className="absolute top-0 right-0 bg-[#8B7CFF] text-white text-[8px] font-bold uppercase tracking-widest px-2 py-1 -mt-2 -mr-2 shadow-[0_18px_40px_rgba(0,0,0,0.10)]">
                        Recommended
                      </span>
                    )}
                    <span className="font-serif text-xl mb-1">{pkg.name}</span>
                    <span className="text-sm text-zinc-500 mb-4">{pkg.images} {pkg.id !== 'custom' ? 'Images' : ''}</span>
                    <span className="mt-auto text-[11px] font-bold tracking-widest uppercase">{pkg.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {isCustomPackage && (
              <section className="flex flex-col gap-4 animate-fade-in">
                <h2 className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">NUMBER OF IMAGES</h2>
                <div className="flex items-center gap-4">
                  <button onClick={() => setCustomImageCount(c => Math.max(1, (Number(c)||1) - 10))} className="w-12 h-12 flex items-center justify-center border border-[rgba(0,0,0,0.05)] hover:bg-[#F9F8F6] text-xl">−</button>
                  <input 
                    type="number" 
                    min="1" 
                    value={customImageCount} 
                    onChange={e => setCustomImageCount(Math.max(1, parseInt(e.target.value) || 1))} 
                    className="w-24 h-12 text-center border border-[rgba(0,0,0,0.05)] focus:outline-none focus:border-foreground"
                  />
                  <button onClick={() => setCustomImageCount(c => (Number(c)||0) + 10)} className="w-12 h-12 flex items-center justify-center border border-[rgba(0,0,0,0.05)] hover:bg-[#F9F8F6] text-xl">+</button>
                </div>
              </section>
            )}

            <section className="flex flex-col gap-6">
              <h2 className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">WHAT DO YOU NEED?</h2>
              <div className="relative">
                <select 
                  value={service} 
                  onChange={e => setService(e.target.value)} 
                  className="w-full border-b border-[rgba(0,0,0,0.05)] py-4 bg-transparent focus:outline-none focus:border-foreground transition-colors font-light text-base appearance-none rounded-none cursor-pointer"
                >
                  {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-6 pt-8 border-t border-[rgba(0,0,0,0.05)]">
              <h2 className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">CLIENT DETAILS (OPTIONAL)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500">Name</label>
                  <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} className="border-b border-[rgba(0,0,0,0.05)] py-2 bg-transparent focus:outline-none focus:border-foreground text-sm font-light" placeholder="Jane Doe" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500">Brand / Company</label>
                  <input type="text" value={clientBrand} onChange={e => setClientBrand(e.target.value)} className="border-b border-[rgba(0,0,0,0.05)] py-2 bg-transparent focus:outline-none focus:border-foreground text-sm font-light" placeholder="Your Brand" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500">Email</label>
                  <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} className="border-b border-[rgba(0,0,0,0.05)] py-2 bg-transparent focus:outline-none focus:border-foreground text-sm font-light" placeholder="jane@brand.com" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500">Phone</label>
                  <input type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="border-b border-[rgba(0,0,0,0.05)] py-2 bg-transparent focus:outline-none focus:border-foreground text-sm font-light" placeholder="+1 234 567 890" />
                </div>
              </div>
            </section>

          </div>

          {/* RIGHT: ESTIMATE & SHEET */}
          <div className="lg:col-span-5 flex flex-col gap-8 print:w-full print:block">
            
            {/* LIVE ESTIMATE HERO */}
            <div className="bg-[#F9F8F6] border border-[rgba(0,0,0,0.05)] p-8 flex flex-col gap-4 sticky top-8 print:hidden">
              <h3 className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">ESTIMATED PROJECT TOTAL</h3>
              <div className="font-serif text-4xl md:text-5xl text-black">
                {estimatedTotal}
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed mt-2 border-t border-[rgba(0,0,0,0.05)] pt-4">
                Pricing applies to standard e-commerce/product imagery. Product-on-model, lifestyle, advanced compositing and campaign visuals are quoted separately.
              </p>
            </div>

            {/* THE QUOTATION SHEET */}
            <div id="quotation-sheet" className="bg-white border border-[rgba(0,0,0,0.05)] p-8 md:p-12 flex flex-col font-sans text-sm print:border-none print:p-0">
              <div className="border-b-2 border-black pb-6 mb-8 flex flex-col gap-2">
                <div className="font-sans font-bold tracking-[0.3em] uppercase text-black">GROTON AI</div>
                <div className="text-zinc-500 tracking-[0.1em] uppercase text-xs">Project Estimate</div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-12">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold tracking-widest uppercase text-zinc-400">Client</span>
                  <span className="font-medium text-black">{clientName || "—"}</span>
                  {clientBrand && <span className="text-zinc-600">{clientBrand}</span>}
                  {clientEmail && <span className="text-zinc-600">{clientEmail}</span>}
                  {clientPhone && <span className="text-zinc-600">{clientPhone}</span>}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold tracking-widest uppercase text-zinc-400">Date</span>
                  <span className="font-medium text-black">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>

              <div className="flex flex-col gap-4 mb-12">
                <div className="flex justify-between border-b border-[rgba(0,0,0,0.05)] pb-2">
                  <span className="text-[9px] font-bold tracking-widest uppercase text-zinc-400">Details</span>
                  <span className="text-[9px] font-bold tracking-widest uppercase text-zinc-400">Value</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">Service</span>
                  <span className="font-medium text-black text-right">{service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">Package</span>
                  <span className="font-medium text-black text-right">{selectedPackage.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">Images</span>
                  <span className="font-medium text-black text-right">{imageCount}</span>
                </div>
              </div>

              <div className="flex flex-col gap-4 mb-12">
                <div className="flex justify-between border-b border-[rgba(0,0,0,0.05)] pb-2">
                  <span className="text-[9px] font-bold tracking-widest uppercase text-zinc-400">Cost Breakdown</span>
                  <span className="text-[9px] font-bold tracking-widest uppercase text-zinc-400">Amount</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">Base Package</span>
                  <span className="font-medium text-black">{isCustomPackage ? "Custom Quote" : selectedPackage.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">Additional Services</span>
                  <span className="font-medium text-black">{CUSTOM_QUOTE_SERVICES.includes(service) ? "Custom Quote" : "—"}</span>
                </div>
              </div>

              <div className="flex justify-between border-t-2 border-black pt-6 mb-12">
                <span className="font-bold text-black uppercase tracking-widest text-xs">Estimated Total</span>
                <span className="font-serif text-2xl text-black">{estimatedTotal}</span>
              </div>

              <div className="mt-auto pt-8 border-t border-[rgba(0,0,0,0.05)] text-[10px] text-zinc-400 leading-relaxed">
                <p className="mb-4">Pricing applies to standard e-commerce/product imagery. Product-on-model, lifestyle, advanced compositing and campaign visuals are quoted separately.</p>
                <p className="font-bold tracking-widest uppercase">GROTON.IN</p>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col sm:flex-row gap-4 print:hidden">
              <button onClick={handlePrint} className="flex-1 border border-[rgba(0,0,0,0.05)] py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#F9F8F6] transition-colors">
                Print Quotation
              </button>
              <button onClick={handleDownloadPDF} className="flex-1 bg-zinc-100 border border-[rgba(0,0,0,0.05)] py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-200 transition-colors text-black">
                Download PDF
              </button>
            </div>

            {/* CTA */}
            <div className="mt-8 bg-[#111111] p-8 text-center flex flex-col items-center print:hidden">
              <h3 className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400 mb-6">READY TO START?</h3>
              <Link href="/contact" className="w-full bg-white text-black py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-200 transition-colors block">
                Start a Project
              </Link>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
