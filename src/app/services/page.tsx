import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import CmsImage from "@/components/CmsImage";
import CmsText from "@/components/CmsText";

export const metadata: Metadata = {
  title: "Services — GROTON AI STUDIO",
  description: "Premium e-commerce visual production and creative direction.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Services — GROTON AI STUDIO",
    description: "Premium e-commerce visual production and creative direction.",
    url: "https://groton.in/services",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/campaign-worlds/groton-services-ai-product-3x4.webp",
        width: 1200,
        height: 1600,
        alt: "Services — GROTON AI STUDIO",
      },
      {
        url: "https://groton.in/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "GROTON AI STUDIO",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Services — GROTON AI STUDIO",
    description: "Premium e-commerce visual production and creative direction.",
    images: ["https://groton.in/og-image.jpg"],
  },
};

const services = [
  {
    id: "ai-product-images",
    title: "AI Product Images",
    description: "Premium product visuals designed for e-commerce, campaigns and brand communication.",
    details: "We ingest your physical products or existing photography and synthesize them into high-fidelity, photorealistic environments. By controlling lighting, materials, and composition algorithmically, we bypass the logistical constraints of physical sets while maintaining absolute realism.",
    deliverables: ["Hero Product Imagery", "E-commerce Product Shots", "Catalog Variations", "High-Resolution Product Composites"],
    image: "/campaign-worlds/groton-services-ai-product-3x4.webp",
    cmsId: "service_ai_product",
    position: ""
  },
  {
    id: "lifestyle-product-imagery",
    title: "Lifestyle Product Imagery",
    description: "Editorial and lifestyle scenes created around your products.",
    details: "We place your products in aspirational, photorealistic environments that tell a brand story. From sun-drenched interiors to high-end architectural spaces, we create contextual imagery without the need for location scouting or physical sets.",
    deliverables: ["Editorial E-commerce Images", "Lifestyle Product Scenes", "Contextual Lookbooks", "Banner & Hero Imagery"],
    image: "/campaign-worlds/groton-services-lifestyle-3x4.webp",
    cmsId: "service_lifestyle",
    position: ""
  },
  {
    id: "advertising-creatives",
    title: "Advertising Creatives",
    description: "Performance-focused visual concepts for paid social and digital campaigns.",
    details: "Data-driven creative for digital advertising. We generate vast variations of visual concepts, allowing brands to test multiple visual angles, environments, and compositions for paid acquisition campaigns without blowing out the production budget.",
    deliverables: ["Paid Social Variations", "Display Ad Creatives", "Campaign Visual Sets", "Performance-focused Layouts"],
    image: "/campaign-worlds/groton-services-advertising-3x4.webp",
    cmsId: "service_advertising",
    position: ""
  },
  {
    id: "social-media-content",
    title: "Social Media Content",
    description: "High-quality visual systems for consistent brand communication.",
    details: "Maintaining a premium social feed requires volume without sacrificing art direction. We build visual systems and generate batches of cohesive, on-brand imagery to fuel your organic social media strategy for months at a time.",
    deliverables: ["Monthly Content Batches", "Social Media Visuals", "Editorial Lifestyle Imagery", "Consistent Brand Aesthetics"],
    image: "/campaign-worlds/groton-services-social-3x4.webp",
    cmsId: "service_social",
    position: ""
  },
  {
    id: "creative-direction",
    title: "Creative Direction",
    description: "Concept development, visual direction, art direction and campaign thinking.",
    details: "AI is a tool; art direction is the differentiator. Our creative directors work with you to establish the visual language, lighting logic, color theory, and conceptual framework before a single pixel is generated.",
    deliverables: ["Visual Identity Systems", "Campaign Concepts", "Art Direction", "Production Briefs"],
    image: "/campaign-worlds/groton-services-creative-direction-3x4.webp",
    cmsId: "service_creative",
    position: "object-[center_15%]"
  }
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F6] flex flex-col font-sans text-black selection:bg-black selection:text-white">
      {/* HEADER */}
      <Header />

      {/* SERVICES CONTENT */}
      <main className="flex-1 w-full">
        <section className="py-24 md:py-32 px-6 md:px-12 lg:px-24 text-center border-b border-[rgba(0,0,0,0.05)] bg-[#F9F8F6] relative z-10 pt-[160px] pb-[80px]">

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 0, 0, 0.035) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.035) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
            maskImage: "linear-gradient(to bottom, black, transparent 90%)",
            WebkitMaskImage: "linear-gradient(to bottom, black, transparent 90%)",
          }}
        />
  
          <CmsText cmsId="services.hero.heading" as="h1" className="font-sans font-bold tracking-[-0.05em] text-5xl md:text-6xl lg:text-7xl mb-8" fallback="Production Capabilities." />
          <CmsText cmsId="services.hero.desc" as="p" className="text-base text-zinc-500 font-light max-w-2xl mx-auto leading-relaxed" fallback="A comprehensive suite of visual generation services, combining sophisticated art direction with the scale and speed of artificial intelligence." />
        </section>

        <div className="flex flex-col">
          {services.map((service, index) => (
            <section key={service.id} id={service.id} className={`py-24 md:py-32 px-6 md:px-12 lg:px-24 flex flex-col lg:flex-row gap-16 lg:gap-24 items-center `}>
              <div className={`w-full lg:w-1/2 flex flex-col ${index % 2 !== 0 ? 'lg:order-2' : ''}`}>
                <span className="text-[10px] tracking-[0.3em] font-bold text-zinc-400 uppercase mb-4">0{index + 1}</span>
                <CmsText cmsId={`services.s${index+1}.title`} as="h2" className="font-sans font-bold tracking-[-0.05em] text-3xl md:text-4xl lg:text-5xl mb-6" fallback={service.title} />
                <CmsText cmsId={`services.s${index+1}.desc`} as="h3" className="font-sans text-lg text-black mb-6 leading-relaxed" fallback={service.description} />
                <CmsText cmsId={`services.s${index+1}.details`} as="p" className="text-sm text-zinc-500 font-light leading-relaxed mb-10" fallback={service.details} />
                <div>
                  <CmsText cmsId={`services.s${index+1}.delivLabel`} as="h4" className="text-[10px] tracking-[0.2em] font-bold text-black uppercase mb-4 border-b border-[rgba(0,0,0,0.05)] pb-2" fallback="Typical Deliverables" />
                  <ul className="flex flex-col gap-3">
                    {service.deliverables.map((item, i) => (
                      <li key={i} className="text-sm text-zinc-500 font-light flex items-center gap-3">
                        <span className="w-1 h-1 bg-black rounded-full"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-12">
                  <Link href="/contact" className="inline-block px-8 py-4 bg-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors rounded-full">
                    <CmsText cmsId={`services.s${index+1}.inquire`} fallback={`Inquire about ${service.title}`} />
                  </Link>
                </div>
              </div>
              <div className={`w-full lg:w-1/2 h-[50vh] lg:h-[70vh] min-h-[400px] relative bg-zinc-200 overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.10)] rounded-[24px] ${index % 2 !== 0 ? 'lg:order-1' : ''}`}>
                <CmsImage cmsId={service.cmsId} fallbackSrc={service.image} alt={service.title} fill className={`object-cover ${service.position || ''}`} />
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
