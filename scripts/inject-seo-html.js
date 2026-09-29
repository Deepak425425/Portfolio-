const fs = require('fs');
const path = require('path');

const TOOL_SEO_CONTENT = {
    "background-remover": {
        title: "Remove Backgrounds from Images Online",
        intro: "Instantly isolate subjects and create transparent backgrounds with our advanced AI background remover.",
        how: ["Upload your image.", "Wait for the AI to automatically detect the subject.", "Download your transparent PNG."],
        features: ["Precise edge detection", "Instant processing", "No quality loss", "Browser-based privacy"],
        related: [{name: "Image Cleanup", path: "/tools/image-cleanup"}, {name: "Image Crop", path: "/tools/crop"}]
    },
    "image-border": {
        title: "Add Beautiful Borders & Frames to Images",
        intro: "Enhance your photos with classic frames, vintage Polaroid borders, and custom padding.",
        how: ["Select your image.", "Choose a border preset or manually adjust padding.", "Select colors and corner radius.", "Export your framed image."],
        features: ["9 unique presets", "Custom corner rounding", "Drop shadow engine", "High-res export"],
        related: [{name: "Image Resizer", path: "/tools/resize"}, {name: "Canvas Padding", path: "/tools/canvas"}, {name: "Image Cropper", path: "/tools/crop"}]
    },
    "color-palette": {
        title: "Generate Color Palettes from Images",
        intro: "Automatically extract dominant colors and create beautiful HEX palettes from any photo.",
        how: ["Upload an image.", "The tool will instantly extract dominant colors.", "Click any color to copy its HEX code.", "Download the palette board."],
        features: ["Automatic extraction", "HEX code generation", "Visual mood boards", "Instant processing"],
        related: [{name: "Color Picker", path: "/tools/color-picker"}, {name: "Image Filters", path: "/tools/filters"}]
    },
    "image-upscaler": {
        title: "Upscale Images & Increase Resolution",
        intro: "Enhance low-resolution images, upscale photos, and improve clarity without losing quality.",
        how: ["Upload your low-res image.", "Select your upscale factor.", "Wait for the AI to enhance the details.", "Download the high-resolution file."],
        features: ["AI upscaling", "Detail preservation", "Noise reduction", "Up to 4x scaling"],
        related: [{name: "Image Quality Checker", path: "/tools/image-quality-checker"}, {name: "Image Compressor", path: "/tools/compressor"}]
    },
    "image-compare": {
        title: "Compare Images Side-by-Side",
        intro: "Visually compare two images using interactive sliders or side-by-side split views.",
        how: ["Upload the 'Before' image.", "Upload the 'After' image.", "Drag the slider to compare.", "Export a comparison graphic."],
        features: ["Interactive slider", "Side-by-side mode", "Difference highlighting", "Export comparison"],
        related: [{name: "Before & After Tool", path: "/tools/before-after"}, {name: "Collage Maker", path: "/tools/collage"}]
    },
    "passport-photo": {
        title: "Create Passport & ID Photos Online",
        intro: "Format, crop, and prepare photos to exact passport, visa, and ID dimensions for any country.",
        how: ["Upload a portrait photo.", "Select your required dimensions (e.g., 2x2 inch).", "Align the face guides.", "Export as a print-ready sheet."],
        features: ["Standard ID dimensions", "Face alignment guides", "Print sheet generator", "High-resolution export"],
        related: [{name: "Image Cropper", path: "/tools/crop"}, {name: "Image Resizer", path: "/tools/resize"}, {name: "Face Blur", path: "/tools/face-blur"}]
    }
};

const TOOLS_DIR = path.join(__dirname, '../src/app/tools');
const toolDirs = fs.readdirSync(TOOLS_DIR).filter(f => fs.statSync(path.join(TOOLS_DIR, f)).isDirectory());

for (const toolDir of toolDirs) {
    const pagePath = path.join(TOOLS_DIR, toolDir, 'page.tsx');
    if (!fs.existsSync(pagePath)) continue;

    let content = fs.readFileSync(pagePath, 'utf8');
    
    // Skip if already injected to prevent duplication
    if (content.includes('id="seo-content-block"')) continue;

    const data = TOOL_SEO_CONTENT[toolDir] || {
        title: `Free Online ${toolDir.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Tool`,
        intro: `Process and edit your images securely in your browser with Groton's free ${toolDir.replace('-', ' ')} utility.`,
        how: ["Upload your image.", "Adjust the tool settings.", "Download your processed image."],
        features: ["Browser-based processing", "No data stored on servers", "High quality export", "Free to use"],
        related: [{name: "Image Converter", path: "/tools/convert"}, {name: "Image Compressor", path: "/tools/compressor"}]
    };

    const relatedLinks = data.related.map(r => `<a href="${r.path}" className="text-[#8B7CFF] hover:underline">${r.name}</a>`).join(' • ');

    const seoBlock = `
      {/* SEO CONTENT BLOCK */}
      <section id="seo-content-block" className="max-w-[1280px] mx-auto w-full px-6 md:px-8 py-16 md:py-24 mt-12 border-t border-zinc-200/50">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 text-zinc-600">
            <div className="flex flex-col gap-4 lg:col-span-2">
               <h2 className="text-2xl font-serif text-[#111111]">{data.title}</h2>
               <p className="text-sm leading-relaxed">{data.intro}</p>
               <h3 className="text-sm font-bold uppercase tracking-widest text-[#111111] mt-6">How to use</h3>
               <ol className="list-decimal list-inside text-sm flex flex-col gap-2">
                  ${data.how.map(step => `<li>${step}</li>`).join('')}
               </ol>
            </div>
            <div className="flex flex-col gap-4">
               <h3 className="text-sm font-bold uppercase tracking-widest text-[#111111]">Key Features</h3>
               <ul className="list-disc list-inside text-sm flex flex-col gap-2">
                  ${data.features.map(feat => `<li>${feat}</li>`).join('')}
               </ul>
               <h3 className="text-sm font-bold uppercase tracking-widest text-[#111111] mt-6">Related Tools</h3>
               <p className="text-sm flex flex-wrap gap-2 leading-relaxed">
                  ${relatedLinks}
               </p>
            </div>
         </div>
         <div className="mt-12 text-xs text-zinc-400 max-w-3xl">
            <strong>Supported Formats:</strong> JPG, PNG, WebP. 
            All image processing is done securely. Groton AI is a suite of online image tools designed for e-commerce, creators, and visual production.
         </div>
      </section>
`;

    // Find the closing </main> tag and insert before it
    const mainCloseIndex = content.lastIndexOf('</main>');
    if (mainCloseIndex !== -1) {
        content = content.slice(0, mainCloseIndex) + seoBlock + content.slice(mainCloseIndex);
        fs.writeFileSync(pagePath, content, 'utf8');
    }
}

console.log("Successfully injected SEO content blocks into all tool pages.");
