const fs = require('fs');
const path = require('path');

const TOOL_SEO_DATA = {
    "background-remover": {
        title: "Background Remover — Isolate Subjects & Remove Backgrounds Online",
        desc: "Instantly remove backgrounds from images online. Isolate subjects, create transparent PNGs, and prepare product images for e-commerce with Groton AI's free image tool."
    },
    "before-after": {
        title: "Before & After Image Tool — Create Comparison Sliders Online",
        desc: "Generate interactive before and after image comparison sliders. Perfect for showcasing retouching, editing, and transformations. Free online image tool by Groton AI."
    },
    "blur": {
        title: "Image Blur Tool — Blur Photos & Hide Information Online",
        desc: "Apply gaussian blur, obscure sensitive information, or create soft depth-of-field effects online. A free and fast image editor by Groton AI."
    },
    "border": {
        title: "Image Border Maker — Add Frames to Images Online",
        desc: "Add classic, vintage, Polaroid, and custom borders to images. Enhance your photos with customizable frames and shadows using Groton's free online image border tool."
    },
    "bulk-image-renamer": {
        title: "Bulk Image Renamer — Rename Multiple Files Online",
        desc: "Rename hundreds of images at once with custom patterns, sequential numbering, and find-and-replace rules. A powerful online utility for photographers."
    },
    "canvas": {
        title: "Image Canvas Resizer — Add Padding & Margins Online",
        desc: "Expand the canvas of your image, add colored padding, margins, or transparent space without cropping. Prepare images for Instagram and e-commerce."
    },
    "cinematic-focus": {
        title: "Cinematic Focus Engine — Optical Blur & Film Effects",
        desc: "Create cinematic focus, radial blur, tilt-shift, and editorial film looks online. A professional grade visual effects tool by Groton AI."
    },
    "collage": {
        title: "Collage Maker — Create Photo Grids & Layouts Online",
        desc: "Combine multiple photos into beautiful grids and collages. Customizable layouts, spacing, and dimensions. A free online image collage maker by Groton."
    },
    "color-palette": {
        title: "Color Palette Generator — Extract Colors from Image",
        desc: "Automatically generate a color palette from any image. Extract dominant HEX colors and create aesthetic mood boards with Groton AI's free tool."
    },
    "color-picker": {
        title: "Image Color Picker — Sample Exact Pixel Colors Online",
        desc: "Upload an image and click anywhere to extract the exact HEX, RGB, and HSL color values. A fast and precise online image tool."
    },
    "compressor": {
        title: "Image Compressor — Reduce File Size Online",
        desc: "Compress JPG, PNG, and WebP images online without losing visible quality. Optimize web performance and reduce file sizes easily with Groton."
    },
    "convert": {
        title: "Image Converter — Change Format to JPG, PNG, WebP",
        desc: "Convert images between JPG, PNG, WebP, and other formats instantly in your browser. Free online image converter by Groton AI."
    },
    "crop": {
        title: "Image Cropper — Crop Photos Online for Free",
        desc: "Crop images precisely with custom aspect ratios, freeform cropping, and high-resolution export. A fast and free online image cropper by Groton."
    },
    "face-blur": {
        title: "Face Blur Tool — Anonymize Photos Online",
        desc: "Automatically detect and blur faces in photos for privacy and anonymity. A secure, browser-based online image tool."
    },
    "favicon": {
        title: "Favicon Generator — Create .ico & Web App Icons",
        desc: "Convert any image into a web-ready favicon.ico and high-resolution app icons for modern websites. Free online utility by Groton AI."
    },
    "filters": {
        title: "Image Filters & Colour Grading — Professional Photo Effects",
        desc: "Apply cinematic image effects, film looks, editorial filters and professional colour grading directly in your browser with Groton's creative studio."
    },
    "grid-cutter": {
        title: "Image Grid Cutter — Slice Photos for Instagram",
        desc: "Cut and slice a single image into multiple seamless grid tiles for Instagram and social media layouts. Free online image splitter."
    },
    "image-border": {
        title: "Image Border Maker — Add Frames to Images",
        desc: "Add classic, vintage, Polaroid, double, film and custom borders to images. A premium online image border tool with high-resolution export."
    },
    "image-cleanup": {
        title: "Image Cleanup Tool — Remove Unwanted Elements",
        desc: "Clean up photos, remove dust, scratches, and minor imperfections online using advanced browser-based tools by Groton AI."
    },
    "image-compare": {
        title: "Image Comparison Tool — Compare Two Images Online",
        desc: "Visually compare two images with interactive sliders, side-by-side views, and difference highlighting. The best before after image comparison tool."
    },
    "image-quality-checker": {
        title: "Image Quality Checker — Analyze Resolution & DPI",
        desc: "Analyze images for print and web suitability. Check resolution, DPI, dimensions, and compression artifacts with Groton's free online image tool."
    },
    "image-upscaler": {
        title: "Image Upscaler — Increase Image Resolution Online",
        desc: "Upscale images and increase resolution without losing quality. Perfect for improving low-res e-commerce product photos and graphics."
    },
    "meme": {
        title: "Meme Generator — Add Text to Images Online",
        desc: "Create memes online quickly. Add classic impact font, custom text, and captions to any image. Free browser-based image editor."
    },
    "metadata-remover": {
        title: "EXIF Metadata Remover — Strip Image Data for Privacy",
        desc: "Remove EXIF data, GPS location, and camera metadata from photos online. Protect your privacy before sharing images with Groton's free tool."
    },
    "passport-photo": {
        title: "Passport Photo Maker — Create ID Photos Online",
        desc: "Format and crop photos to standard passport, visa, and ID dimensions. Generate print-ready sheets with Groton's online passport photo maker."
    },
    "pdf-contact-sheet": {
        title: "PDF Contact Sheet Generator — Create Photo Galleries",
        desc: "Generate professional multi-image PDF contact sheets and galleries. Choose grid layouts, margins, and paper sizes online for free."
    },
    "pixelate": {
        title: "Image Pixelator — Censor Photos & Create 8-Bit Art",
        desc: "Pixelate faces, censor sensitive information, or create retro 8-bit aesthetic art online. A fast and free image editor by Groton AI."
    },
    "resize": {
        title: "Image Resizer — Change Image Dimensions Online",
        desc: "Resize images online with precise pixel dimensions, percentage scaling, and aspect ratio locks. Perfect for e-commerce and social media."
    },
    "rotate-flip": {
        title: "Rotate & Flip Image — Mirror Photos Online",
        desc: "Rotate images by degrees, flip horizontally, or mirror vertically online. Quick and free browser-based image adjustment tool."
    },
    "rounded-image": {
        title: "Rounded Image Tool — Add Curved Corners to Photos",
        desc: "Add smooth rounded corners to your images and export as transparent PNGs online. A modern and free image formatting tool."
    },
    "social-resizer": {
        title: "Social Media Image Resizer — Format for All Platforms",
        desc: "Instantly resize and format images for Instagram, Twitter, Facebook, YouTube, and LinkedIn. A free online image tool by Groton AI."
    },
    "split": {
        title: "Image Splitter — Divide Photos Online",
        desc: "Split an image into multiple equal pieces horizontally or vertically. Perfect for panoramas and grid posts on social media."
    },
    "watermark": {
        title: "Watermark Creator — Protect Your Images Online",
        desc: "Add repeating text or logo watermarks to your photos to protect your intellectual property. A free and secure online watermark tool."
    },
    "watermark-remover": {
        title: "Watermark Remover — Content-Aware Object Removal",
        desc: "Remove unwanted marks, objects, text and watermarks from images using intelligent browser-side inpainting by Groton AI."
    }
};

const TOOLS_DIR = path.join(__dirname, '../src/app/tools');

const toolDirs = fs.readdirSync(TOOLS_DIR).filter(f => fs.statSync(path.join(TOOLS_DIR, f)).isDirectory());

for (const toolDir of toolDirs) {
    const layoutPath = path.join(TOOLS_DIR, toolDir, 'layout.tsx');
    const data = TOOL_SEO_DATA[toolDir] || {
        title: `${toolDir.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} — Free Online Image Tool`,
        desc: `Use Groton AI's online ${toolDir.replace('-', ' ')} tool to edit and process your images securely in your browser.`
    };

    const layoutContent = `import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "${data.title}",
  description: "${data.desc}",
  alternates: {
    canonical: "/tools/${toolDir}",
  },
  openGraph: {
    title: "${data.title}",
    description: "${data.desc}",
    url: "https://groton.in/tools/${toolDir}",
    siteName: "GROTON AI",
    images: [
      {
        url: "https://groton.in/og-tools.jpg",
        width: 1200,
        height: 630,
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "${data.title}",
    description: "${data.desc}",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
`;

    fs.writeFileSync(layoutPath, layoutContent, 'utf8');
}

console.log("Successfully updated all tool layout files with optimized SEO metadata.");
