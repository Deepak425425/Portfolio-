import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Services() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-6 py-24 md:py-32 w-full">
        <h1 className="font-serif text-4xl md:text-6xl mb-16">Services</h1>
        <div className="flex flex-col gap-12 border-t border-zinc-200 pt-12">
          {[
            { title: "AI Product Images", desc: "High-end product photography generated with AI, featuring realistic lighting and materials." },
            { title: "AI Commercial Reels / Films", desc: "Cinematic motion pieces that capture the essence of your brand." },
            { title: "Product Advertising", desc: "Striking visuals tailored for high-conversion advertising campaigns." },
            { title: "Social Media Creatives", desc: "Engaging and premium content designed for modern social platforms." },
            { title: "Creative Direction", desc: "Guiding the visual identity and aesthetic strategy for your brand's future." }
          ].map((service, i) => (
            <div key={i} className="flex flex-col md:flex-row gap-4 md:gap-16 items-start border-b border-zinc-100 pb-12">
              <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 w-12 pt-2">0{i+1}</span>
              <div className="flex-1">
                <h3 className="font-serif text-2xl md:text-4xl text-black mb-4">{service.title}</h3>
                <p className="font-sans text-sm text-zinc-500 max-w-md">{service.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
