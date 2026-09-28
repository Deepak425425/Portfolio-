import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services — PhotoLoom",
  description: "Premium e-commerce visual production and creative direction.",
};

const services = [
  {
    id: "ai-product-images",
    title: "AI Product Images",
    description: "Premium product visuals designed for eCommerce, campaigns and brand communication.",
    details: "We ingest your physical products or existing photography and synthesize them into high-fidelity, photorealistic environments. By controlling lighting, materials, and composition algorithmically, we bypass the logistical constraints of physical sets while maintaining absolute realism.",
    deliverables: ["Hero Campaign Imagery", "E-commerce Product Shots", "Lookbook Variations", "High-Resolution Composites"],
    image: "/work/jewellery.jpg"
  },
  {
    id: "lifestyle-product-imagery",
    title: "Lifestyle Product Imagery",
    "description": "Editorial and lifestyle scenes for e-commerce products.",
    "details": "We place your products in aspirational, photorealistic environments that tell a brand story. From sun-drenched interiors to high-end architectural spaces, we create contextual imagery without the need for location scouting or physical sets.",
    "deliverables": ["Editorial E-commerce Images", "Social Media Lifestyle Shots", "Contextual Lookbooks", "Banner & Hero Imagery"],
    image: "/work/campaign.jpg"
  },
  {
    id: "advertising-creatives",
    title: "Advertising Creatives",
    description: "Performance-focused visual concepts for paid social and digital campaigns.",
    details: "Data-driven creative for digital advertising. We generate vast variations of visual concepts, allowing brands to test multiple visual angles, environments, and compositions for paid acquisition campaigns without blowing out the production budget.",
    deliverables: ["Paid Social Variations", "Display Ad Composites", "A/B Testing Visual Sets", "Performance Layouts"],
    image: "/work/product.jpg"
  },
  {
    id: "social-media-content",
    title: "Social Media Content",
    description: "High-quality visual systems for consistent brand communication.",
    details: "Maintaining a premium social feed requires volume without sacrificing art direction. We build visual systems and generate batches of cohesive, on-brand imagery to fuel your organic social media strategy for months at a time.",
    deliverables: ["Monthly Content Batches", "Grid Layout Planning", "Editorial Lifestyle Imagery", "Consistent Brand Aesthetics"],
    image: "/work/fashion.jpg"
  },
  {
    id: "creative-direction",
    title: "Creative Direction",
    description: "Concept development, visual direction, art direction and campaign thinking.",
    details: "AI is a tool; art direction is the differentiator. Our creative directors work with you to establish the visual language, lighting logic, color theory, and conceptual framework before a single pixel is generated.",
    deliverables: ["Visual Identity Systems", "Campaign Concepts", "Lighting & Texture Boards", "Production Briefs"],
    image: "/images/luxury.jpg"
  }
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans text-black selection:bg-black selection:text-white">
      {/* HEADER */}
      <header className="w-full p-6 md:px-12 lg:px-24 flex flex-row justify-between items-center z-30 bg-white border-b border-zinc-200">
        <Link href="/" className="font-sans font-bold tracking-[0.3em] text-sm md:text-base uppercase text-black">
          PhotoLoom
        </Link>
        <div className="flex items-center gap-8">
          <nav className="hidden lg:flex items-center gap-8 text-[11px] font-bold tracking-[0.2em] uppercase text-zinc-400">
            <Link href="/work" className="hover:text-black transition-colors">Work</Link>
            <Link href="/services" className="text-black transition-colors">Services</Link>
            <Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link>
            <Link href="/about" className="hover:text-black transition-colors">About</Link>
          </nav>
          <Link href="/contact" className="px-5 py-3 bg-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors">
            Contact
          </Link>
        </div>
      </header>

      {/* SERVICES CONTENT */}
      <main className="flex-1 w-full">
        <section className="py-24 md:py-32 px-6 md:px-12 lg:px-24 text-center border-b border-zinc-200 bg-white">
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl mb-8">Production Capabilities.</h1>
          <p className="text-base text-zinc-500 font-light max-w-2xl mx-auto leading-relaxed">
            A comprehensive suite of visual generation services, combining sophisticated art direction with the scale and speed of artificial intelligence.
          </p>
        </section>

        <div className="flex flex-col">
          {services.map((service, index) => (
            <section key={service.id} id={service.id} className={`py-24 md:py-32 px-6 md:px-12 lg:px-24 flex flex-col lg:flex-row gap-16 lg:gap-24 items-center ${index % 2 !== 0 ? 'bg-white' : 'bg-zinc-50'}`}>
              <div className={`w-full lg:w-1/2 flex flex-col ${index % 2 !== 0 ? 'lg:order-2' : ''}`}>
                <span className="text-[10px] tracking-[0.3em] font-bold text-zinc-400 uppercase mb-4">0{index + 1}</span>
                <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-6">{service.title}</h2>
                <h3 className="font-sans text-lg text-black mb-6 leading-relaxed">{service.description}</h3>
                <p className="text-sm text-zinc-500 font-light leading-relaxed mb-10">{service.details}</p>
                
                <div>
                  <h4 className="text-[10px] tracking-[0.2em] font-bold text-black uppercase mb-4 border-b border-zinc-200 pb-2">Typical Deliverables</h4>
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
                  <Link href="/contact" className="inline-block px-8 py-4 bg-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors">
                    Inquire about {service.title}
                  </Link>
                </div>
              </div>
              <div className={`w-full lg:w-1/2 h-[50vh] lg:h-[70vh] min-h-[400px] relative bg-zinc-200 overflow-hidden ${index % 2 !== 0 ? 'lg:order-1' : ''}`}>
                <Image src={service.image} alt={service.title} fill className="object-cover" />
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-white border-t border-zinc-200 mt-auto">
        <div className="max-w-[1400px] mx-auto p-8 md:p-16 flex flex-col gap-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
            <h3 className="font-sans font-bold tracking-[0.3em] text-xl md:text-2xl uppercase text-black">PhotoLoom</h3>
            <div className="flex flex-wrap gap-x-8 gap-y-4 text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500">
              <Link href="/about" className="hover:text-black transition-colors">About</Link>
              <Link href="/services" className="text-black transition-colors">Services</Link>
              <Link href="/work" className="hover:text-black transition-colors">Work</Link>
              <Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link>
              <Link href="/contact" className="hover:text-black transition-colors">Contact</Link>
              <Link href="/privacy-policy" className="hover:text-black transition-colors">Privacy Policy</Link>
              <Link href="/terms-and-conditions" className="hover:text-black transition-colors">Terms & Conditions</Link>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-8 border-t border-zinc-100">
            <p className="text-[10px] text-zinc-400 tracking-[0.2em] uppercase font-bold">
              &copy; 2026 PhotoLoom
            </p>
            <p className="text-[10px] text-zinc-400 tracking-[0.2em] uppercase font-bold">
              A creative venture by <a href="https://graflystudio.com" target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-black transition-colors">Grafly Studio</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
