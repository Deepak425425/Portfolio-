import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services — GROTON AI STUDIO",
  description: "Premium e-commerce visual production and creative direction.",
};

const services = [
  {
    id: "ai-product-images",
    title: "AI Product Images",
    description: "Premium product visuals designed for e-commerce, campaigns and brand communication.",
    details: "We ingest your physical products or existing photography and synthesize them into high-fidelity, photorealistic environments. By controlling lighting, materials, and composition algorithmically, we bypass the logistical constraints of physical sets while maintaining absolute realism.",
    deliverables: ["Hero Product Imagery", "E-commerce Product Shots", "Catalog Variations", "High-Resolution Product Composites"],
    image: "/campaign-worlds/groton-14.jpg",
    position: ""
  },
  {
    id: "lifestyle-product-imagery",
    title: "Lifestyle Product Imagery",
    description: "Editorial and lifestyle scenes created around your products.",
    details: "We place your products in aspirational, photorealistic environments that tell a brand story. From sun-drenched interiors to high-end architectural spaces, we create contextual imagery without the need for location scouting or physical sets.",
    deliverables: ["Editorial E-commerce Images", "Lifestyle Product Scenes", "Contextual Lookbooks", "Banner & Hero Imagery"],
    image: "/campaign-worlds/groton-10.jpg",
    position: ""
  },
  {
    id: "advertising-creatives",
    title: "Advertising Creatives",
    description: "Performance-focused visual concepts for paid social and digital campaigns.",
    details: "Data-driven creative for digital advertising. We generate vast variations of visual concepts, allowing brands to test multiple visual angles, environments, and compositions for paid acquisition campaigns without blowing out the production budget.",
    deliverables: ["Paid Social Variations", "Display Ad Creatives", "Campaign Visual Sets", "Performance-focused Layouts"],
    image: "/campaign-worlds/groton-17.jpg",
    position: ""
  },
  {
    id: "social-media-content",
    title: "Social Media Content",
    description: "High-quality visual systems for consistent brand communication.",
    details: "Maintaining a premium social feed requires volume without sacrificing art direction. We build visual systems and generate batches of cohesive, on-brand imagery to fuel your organic social media strategy for months at a time.",
    deliverables: ["Monthly Content Batches", "Social Media Visuals", "Editorial Lifestyle Imagery", "Consistent Brand Aesthetics"],
    image: "/campaign-worlds/groton-3.jpg",
    position: ""
  },
  {
    id: "creative-direction",
    title: "Creative Direction",
    description: "Concept development, visual direction, art direction and campaign thinking.",
    details: "AI is a tool; art direction is the differentiator. Our creative directors work with you to establish the visual language, lighting logic, color theory, and conceptual framework before a single pixel is generated.",
    deliverables: ["Visual Identity Systems", "Campaign Concepts", "Art Direction", "Production Briefs"],
    image: "/campaign-worlds/High-Angle Editorial Fashion Portrait (1).jpeg",
    position: "object-[center_15%]"
  }
];

export default function ServicesPage() {
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
            <Link href="/services" className="text-black transition-colors">Services</Link>
            <Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link>
            <Link href="/tools" className="hover:text-black transition-colors">Tools</Link>
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
              <div className={`w-full lg:w-1/2 h-[50vh] lg:h-[70vh] min-h-[400px] relative bg-zinc-200 overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.10)] ${index % 2 !== 0 ? 'lg:order-1' : ''}`}>
                <Image src={service.image} alt={service.title} fill className={`object-cover ${service.position || ''}`} />
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-white border-t border-zinc-200 mt-auto">
        <div className="max-w-[1400px] mx-auto p-8 md:p-16 flex flex-col gap-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
            <h3 className="font-sans font-bold tracking-[0.3em] text-xl md:text-2xl uppercase text-black">GROTON AI STUDIO</h3>
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
