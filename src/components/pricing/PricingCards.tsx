"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import CmsText from "@/components/CmsText";

export default function PricingCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 xl:gap-10">
      {/* STARTER */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="h-full"
      >
        <div className="bg-white rounded-[24px] p-8 sm:p-10 lg:p-9 xl:p-12 flex flex-col gap-6 shadow-[0_18px_40px_rgba(0,0,0,0.10)] hover:shadow-[0_25px_55px_rgba(0,0,0,0.14)] hover:-translate-y-1.5 transition-all duration-500 h-full group">
          <CmsText cmsId="pricing.t1.name" as="h3" className="font-sans font-bold tracking-[0.2em] text-xs text-zinc-400 uppercase" fallback="Starter" />
          <CmsText cmsId="pricing.t1.volume" as="div" className="font-sans font-bold tracking-[-0.05em] text-3xl sm:text-4xl xl:text-5xl text-black" fallback="25 Images" />
          <div className="pb-6 sm:pb-8 pt-2 border-b border-zinc-100 flex flex-col gap-2">
            <div className="text-2xl sm:text-3xl font-sans font-light tracking-tight text-zinc-800">
              <CmsText cmsId="pricing.t1.price" fallback="₹2,500" />
              <span className="text-lg text-zinc-400 ml-1">+</span>
            </div>
            <CmsText cmsId="pricing.t1.unit" as="div" className="text-[10px] text-zinc-400 font-bold tracking-[0.2em] uppercase" fallback="₹100 / Image" />
          </div>
          <CmsText cmsId="pricing.t1.desc" as="p" className="text-sm text-zinc-500 font-light flex-1 leading-relaxed mt-2" fallback="Perfect for a foundational collection of high-quality product assets, clean catalog shots, or launching a new small capsule." />
          <Link
            href="/contact?package=Starter"
            className="w-full py-3.5 sm:py-4 px-6 rounded-full bg-black text-white text-xs uppercase tracking-[0.2em] font-bold text-center hover:bg-zinc-800 transition-all duration-200 mt-2 shadow-[0_4px_14px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 flex items-center justify-center"
          >
            Select Starter
          </Link>
        </div>
      </motion.div>
      
      {/* GROWTH (Recommended) */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.7, delay: 0.22, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="h-full"
      >
        <div className="border border-black rounded-[24px] p-8 sm:p-10 lg:p-9 xl:p-12 flex flex-col gap-6 shadow-2xl hover:shadow-[0_32px_65px_rgba(0,0,0,0.35)] bg-black text-white lg:-translate-y-4 hover:-translate-y-1.5 lg:hover:-translate-y-6 transition-all duration-500 h-full relative">
          <CmsText cmsId="pricing.t2.badge" as="div" className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#8B7CFF] text-black text-[9px] uppercase tracking-widest font-bold px-4 py-1 rounded-full pointer-events-none" fallback="Recommended" />
          <CmsText cmsId="pricing.t2.name" as="h3" className="font-sans font-bold tracking-[0.2em] text-xs text-zinc-400 uppercase" fallback="Growth" />
          <CmsText cmsId="pricing.t2.volume" as="div" className="font-sans font-bold tracking-[-0.05em] text-3xl sm:text-4xl xl:text-5xl text-white" fallback="50 Images" />
          <div className="pb-6 sm:pb-8 pt-2 border-b border-zinc-800 flex flex-col gap-2">
            <div className="text-2xl sm:text-3xl font-sans font-light tracking-tight text-zinc-100">
              <CmsText cmsId="pricing.t2.price" fallback="₹4,500" />
              <span className="text-lg text-zinc-500 ml-1">+</span>
            </div>
            <CmsText cmsId="pricing.t2.unit" as="div" className="text-[10px] text-zinc-500 font-bold tracking-[0.2em] uppercase" fallback="₹90 / Image" />
          </div>
          <CmsText cmsId="pricing.t2.desc" as="p" className="text-sm text-zinc-400 font-light flex-1 leading-relaxed mt-2" fallback="The ideal volume for comprehensive e-commerce listings, dynamic social media batches, and cohesive brand storytelling." />
          <Link
            href="/contact?package=Growth"
            className="w-full py-3.5 sm:py-4 px-6 rounded-full bg-white text-black text-xs uppercase tracking-[0.2em] font-bold text-center hover:bg-[#8B7CFF] hover:text-black transition-all duration-200 mt-2 shadow-[0_4px_14px_rgba(255,255,255,0.12)] hover:-translate-y-0.5 flex items-center justify-center"
          >
            Select Growth
          </Link>
        </div>
      </motion.div>

      {/* SCALE */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.7, delay: 0.34, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="h-full"
      >
        <div className="bg-white rounded-[24px] p-8 sm:p-10 lg:p-9 xl:p-12 flex flex-col gap-6 shadow-[0_18px_40px_rgba(0,0,0,0.10)] hover:shadow-[0_25px_55px_rgba(0,0,0,0.14)] hover:-translate-y-1.5 transition-all duration-500 h-full group">
          <CmsText cmsId="pricing.t3.name" as="h3" className="font-sans font-bold tracking-[0.2em] text-xs text-zinc-400 uppercase" fallback="Scale" />
          <CmsText cmsId="pricing.t3.volume" as="div" className="font-sans font-bold tracking-[-0.05em] text-3xl sm:text-4xl xl:text-5xl text-black" fallback="100 Images" />
          <div className="pb-6 sm:pb-8 pt-2 border-b border-zinc-100 flex flex-col gap-2">
            <div className="text-2xl sm:text-3xl font-sans font-light tracking-tight text-zinc-800">
              <CmsText cmsId="pricing.t3.price" fallback="₹8,000" />
              <span className="text-lg text-zinc-400 ml-1">+</span>
            </div>
            <CmsText cmsId="pricing.t3.unit" as="div" className="text-[10px] text-zinc-400 font-bold tracking-[0.2em] uppercase" fallback="₹80 / Image" />
          </div>
          <CmsText cmsId="pricing.t3.desc" as="p" className="text-sm text-zinc-500 font-light flex-1 leading-relaxed mt-2" fallback="Built for high-volume catalogs, robust digital marketing campaigns, and brands scaling their entire visual inventory." />
          <Link
            href="/contact?package=Scale"
            className="w-full py-3.5 sm:py-4 px-6 rounded-full bg-black text-white text-xs uppercase tracking-[0.2em] font-bold text-center hover:bg-zinc-800 transition-all duration-200 mt-2 shadow-[0_4px_14px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 flex items-center justify-center"
          >
            Select Scale
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
