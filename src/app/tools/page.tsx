"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const toolsData = [
  // OPTIMIZE
  { id: "compressor", name: "Image Compressor", desc: "Reduce file sizes aggressively.", cat: "OPTIMIZE", tags: ["compress", "size", "kb", "mb", "reduce", "optimize"], link: "/tools/compressor", visual: "100KB → 42KB" },
  { id: "resize", name: "Image Resizer", desc: "Scale images to exact dimensions.", cat: "OPTIMIZE", tags: ["resize", "scale", "dimensions", "width", "height"], link: "/tools/resize", visual: "2000 → 1080" },
  { id: "convert", name: "Image Converter", desc: "Convert formats (JPG, PNG, WebP).", cat: "OPTIMIZE", tags: ["convert", "format", "jpg", "png", "webp", "jpeg"], link: "/tools/convert", visual: "JPG → WEBP" },
  { id: "metadata-remover", name: "Metadata Remover", desc: "Strip EXIF data from photos.", cat: "OPTIMIZE", tags: ["exif", "metadata", "gps", "camera", "privacy"], link: "/tools/metadata-remover", visual: "EXIF ✕" },
  { id: "image-quality-checker", name: "Image Quality Checker", desc: "Analyze images for web & print suitability.", cat: "OPTIMIZE", tags: ["quality", "check", "analyze", "print", "web", "report"], link: "/tools/image-quality-checker", visual: "✓ Resolution\n✓ Format\n⚠ Print Quality" },
  
  // EDIT
  { id: "image-cleanup", name: "Image Cleanup", desc: "Remove unwanted elements & dust.", cat: "EDIT", tags: ["cleanup", "remove", "erase", "dust", "spot", "heal"], link: "/tools/image-cleanup", visual: "✨" },
  { id: "crop", name: "Image Cropper", desc: "Crop and reframe photos.", cat: "EDIT", tags: ["crop", "trim", "cut"], link: "/tools/crop", visual: "Crop" },
  { id: "rotate-flip", name: "Rotate & Flip", desc: "Quickly rotate or mirror images.", cat: "EDIT", tags: ["rotate", "flip", "mirror", "turn"], link: "/tools/rotate-flip", visual: "↺ ⇄" },
  { id: "blur", name: "Image Blur", desc: "Apply gaussian blur effects.", cat: "EDIT", tags: ["blur", "soften", "gaussian"], link: "/tools/blur", visual: "Blur" },
  { id: "pixelate", name: "Pixelate Image", desc: "Create 8-bit style pixelation.", cat: "EDIT", tags: ["pixelate", "censor", "8bit", "retro"], link: "/tools/pixelate", visual: "■□■" },
  { id: "filters", name: "Image Filters", desc: "Apply color adjustments & filters.", cat: "EDIT", tags: ["filter", "color", "adjust", "contrast", "brightness", "saturation"], link: "/tools/filters", visual: "✦✧✦" },
  { id: "border", name: "Image Border", desc: "Add colored borders to images.", cat: "EDIT", tags: ["border", "frame", "outline"], link: "/tools/border", visual: "□" },
  { id: "rounded-image", name: "Rounded Image", desc: "Export with transparent curved corners.", cat: "EDIT", tags: ["round", "corners", "radius", "circle"], link: "/tools/rounded-image", visual: "╭╮\n╰╯" },
  { id: "canvas", name: "Canvas / Padding", desc: "Add surrounding padding/margins.", cat: "EDIT", tags: ["padding", "margin", "canvas", "expand"], link: "/tools/canvas", visual: "⛶" },

  // CREATE
  { id: "collage", name: "Collage Maker", desc: "Combine multiple images into one.", cat: "CREATE", tags: ["collage", "combine", "join", "merge", "layout"], link: "/tools/collage", visual: "⊞" },
  { id: "grid-cutter", name: "Grid Cutter", desc: "Slice an image into an Instagram grid.", cat: "CREATE", tags: ["grid", "slice", "cut", "split", "instagram", "tiles"], link: "/tools/grid-cutter", visual: "▦" },
  { id: "before-after", name: "Before & After", desc: "Create vertical comparison sliders.", cat: "CREATE", tags: ["compare", "before", "after", "slider"], link: "/tools/before-after", visual: "◧◨" },
  { id: "image-compare", name: "Image Compare", desc: "Compare two images visually.", cat: "CREATE", tags: ["compare", "before", "after", "difference", "slider"], link: "/tools/image-compare", visual: "BEFORE | AFTER" },
  { id: "meme", name: "Meme Generator", desc: "Add classic impact font text.", cat: "CREATE", tags: ["meme", "text", "caption", "funny"], link: "/tools/meme", visual: "T" },
  { id: "pdf-contact-sheet", name: "Contact Sheet", desc: "Generate multi-image PDF galleries.", cat: "CREATE", tags: ["contact", "sheet", "gallery", "pdf", "print"], link: "/tools/pdf-contact-sheet", visual: "▤" },

  // ORGANIZE
  { id: "bulk-image-renamer", name: "Bulk Image Renamer", desc: "Rename hundreds of images quickly with powerful batch naming controls.", cat: "ORGANIZE", tags: ["rename", "batch", "bulk", "organize", "files", "names"], link: "/tools/bulk-image-renamer", visual: "IMG_4821.jpg\n↓\nProduct-001.jpg" },

  // PROTECT
  { id: "watermark", name: "Watermark", desc: "Apply repeated watermark patterns.", cat: "PROTECT", tags: ["watermark", "protect", "logo", "text", "stamp", "brand"], link: "/tools/watermark", visual: "©" },
  { id: "face-blur", name: "Face Blur", desc: "Auto-detect and blur faces.", cat: "PROTECT", tags: ["face", "blur", "censor", "privacy", "hide", "ai"], link: "/tools/face-blur", visual: "👤" },

  // TRANSFORM
  { id: "background-remover", name: "Background Remover", desc: "Isolate subjects instantly.", cat: "TRANSFORM", tags: ["background", "remove", "transparent", "cutout", "ai", "subject"], link: "/tools/background-remover", visual: "✂" },
  { id: "image-upscaler", name: "Image Upscaler", desc: "Increase image resolution preserving quality.", cat: "TRANSFORM", tags: ["upscale", "enhance", "resolution", "enlarge", "zoom"], link: "/tools/image-upscaler", visual: "1200×800\n↓\n2400×1600" },
  { id: "social-resizer", name: "Social Media Resizer", desc: "Format for Instagram, YouTube, etc.", cat: "TRANSFORM", tags: ["social", "instagram", "youtube", "tiktok", "resize", "aspect"], link: "/tools/social-resizer", visual: "📱" },
  { id: "passport-photo", name: "Passport Photo", desc: "Format to standard ID dimensions.", cat: "TRANSFORM", tags: ["passport", "id", "photo", "visa", "print"], link: "/tools/passport-photo", visual: "🪪" },
  { id: "favicon", name: "Favicon Generator", desc: "Create .ico and webapp icons.", cat: "TRANSFORM", tags: ["favicon", "icon", "website", "ico"], link: "/tools/favicon", visual: "◆" },
  { id: "color-palette", name: "Color Palette", desc: "Extract dominant hex colors.", cat: "TRANSFORM", tags: ["color", "palette", "hex", "rgb", "swatch", "theme"], link: "/tools/color-palette", visual: "🎨" },
  { id: "color-picker", name: "Color Picker", desc: "Sample specific pixels.", cat: "TRANSFORM", tags: ["color", "picker", "eyedropper", "sample"], link: "/tools/color-picker", visual: "💉" }
];

export default function ToolsLandingPage() {
  const [search, setSearch] = useState("");

  const filteredTools = toolsData.filter(t => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return t.name.toLowerCase().includes(q) || 
           t.desc.toLowerCase().includes(q) || 
           t.tags.some(tag => tag.includes(q));
  });

  const categories = ["OPTIMIZE", "EDIT", "CREATE", "ORGANIZE", "PROTECT", "TRANSFORM"];

  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Navigation />
      
      <div className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-8 py-16 md:py-24">
        
        <div className="flex flex-col items-start gap-4 mb-16 w-full">
          <div className="max-w-3xl">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent">GROTON AI / TOOLS</span>
            <h1 className="text-4xl md:text-6xl font-serif tracking-tight leading-tight">Image tools, without the busywork.</h1>
            <p className="text-lg text-sec-text mt-2 font-light">Fast, browser-based tools for converting, resizing, compressing, organizing and preparing images.</p>
            
            <div className="flex flex-wrap gap-4 mt-6">
              <a href="#explore" className="bg-accent text-white px-8 py-4 text-xs uppercase tracking-widest font-bold hover:bg-accent-dark transition-colors">
                Explore Tools
              </a>
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Search tools... (e.g. 'compress')"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-white border border-border-color px-6 py-4 text-sm w-[300px] focus:outline-none focus:border-accent transition-colors shadow-sm"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border-color/50 w-full">
            <p className="text-[10px] uppercase tracking-widest font-bold text-sec-text mb-6">What do you want to do?</p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Make it smaller", link: "/tools/compressor" },
                { label: "Change format", link: "/tools/convert" },
                { label: "Remove background", link: "/tools/background-remover" },
                { label: "Create color palette", link: "/tools/color-palette" },
                { label: "Resize for social", link: "/tools/social-resizer" },
                { label: "Add watermark", link: "/tools/watermark" },
                { label: "Blur a face", link: "/tools/face-blur" },
                { label: "Create collage", link: "/tools/collage" },
                { label: "Make PDF", link: "/tools/pdf-contact-sheet" }
              ].map(action => (
                <Link key={action.label} href={action.link} className="px-5 py-2.5 bg-white border border-border-color text-xs font-bold text-foreground hover:border-black transition-colors rounded-sm shadow-sm hover:shadow">
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* TOOLS GRID */}
        <div id="explore" className="flex flex-col gap-24">
          
          {categories.map(cat => {
            const catTools = filteredTools.filter(t => t.cat === cat);
            if (catTools.length === 0) return null;

            return (
              <section key={cat} className="flex flex-col gap-8">
                <h2 className="text-[11px] uppercase tracking-[0.2em] font-bold text-sec-text border-b border-border-color pb-4">{cat}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {catTools.map(tool => (
                    <Link 
                      key={tool.id} 
                      href={tool.link}
                      className="group bg-white border border-border-color p-6 flex flex-col gap-6 hover:border-accent hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    >
                      {/* Visual Preview Box */}
                      <div className="w-full h-24 bg-background border border-border-color/50 flex items-center justify-center overflow-hidden">
                        <div className="text-accent font-mono text-sm tracking-widest font-bold transition-transform duration-300 group-hover:scale-110 whitespace-pre text-center">
                          {tool.visual}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 relative">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-base tracking-tight">{tool.name}</h3>
                          <span className="text-accent opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 duration-300">↗</span>
                        </div>
                        <p className="text-[12px] text-sec-text leading-relaxed">{tool.desc}</p>
                        
                        <div className="mt-4 pt-4 border-t border-border-color/30 flex gap-2 overflow-x-auto no-scrollbar">
                           {tool.tags.slice(0, 3).map(tag => (
                             <span key={tag} className="text-[9px] uppercase tracking-wider text-sec-text bg-background px-2 py-1 border border-border-color/50 rounded-sm">
                               {tag}
                             </span>
                           ))}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}

          {filteredTools.length === 0 && (
            <div className="py-24 text-center flex flex-col items-center justify-center gap-4">
               <span className="text-4xl">🔍</span>
               <h3 className="text-xl font-serif">No tools found for "{search}"</h3>
               <p className="text-sec-text text-sm">Try searching for keywords like "resize", "pdf", or "watermark".</p>
               <button onClick={() => setSearch("")} className="mt-4 border border-border-color px-6 py-2 text-xs uppercase tracking-widest font-bold hover:bg-zinc-50">Clear Search</button>
            </div>
          )}

        </div>

      </div>
      <Footer />
    </main>
  );
}
