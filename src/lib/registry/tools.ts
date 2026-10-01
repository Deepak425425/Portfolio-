export interface RegisteredTool {
  id: string;
  name: string;
  route: string | null;
  description: string;
  category: 'featured' | 'utility' | 'specialized' | 'other' | 'planned';
  visual: string;
  keywords: string[];
  capability?: 'available' | 'planned';
}

export const TOOL_REGISTRY: RegisteredTool[] = [
  // ==========================================
  // PLANNED TOOLS (AI ONLY)
  // ==========================================
  {
    id: "add-text",
    name: "Add Text to Image",
    route: null,
    category: "planned",
    visual: "T",
    capability: "planned",
    description: "Write something on an image.",
    keywords: ["image me mera name add karna hai", "photo me naam likhna hai", "image par text add karna hai", "photo pe text lagana hai", "image me kuch likhna hai", "photo par mera naam likhna hai", "add text to image", "put text on photo", "write something on image", "image pe naam add", "photo me text add", "naam likhna", "mera name add"]
  },

  // ==========================================
  // FEATURED TOOLS
  // ==========================================
  { 
    id: "filters", 
    name: "Image Filters & Grade", 
    route: "/tools/filters", 
    category: "featured",
    visual: "✦",
    description: "Professional creative filters and colour grading studio.",
    keywords: ["filter", "filters", "color grade", "grade", "lut", "effect", "effects", "photo filter", "color correct", "image filter", "photo pe filter lagana", "filter lagana"] 
  },
  { 
    id: "image-compare", 
    name: "Image Compare", 
    route: "/tools/image-compare", 
    category: "featured",
    visual: "◧",
    description: "Compare two images visually with side-by-side or slider tools.",
    keywords: ["compare", "before after", "comparison", "dono image", "2 images compare karni hain", "compare images", "image slider"] 
  },
  { 
    id: "collage", 
    name: "Collage Maker", 
    route: "/tools/collage", 
    category: "featured",
    visual: "⊞",
    description: "Professional grid layout builder with precise constraints.",
    keywords: ["collage", "ek saath lagana", "combine", "multiple images", "collagee", "photo grid", "grid maker", "join images"] 
  },
  { 
    id: "image-border", 
    name: "Image Border", 
    route: "/tools/image-border", 
    category: "featured",
    visual: "□",
    description: "Add refined frames, shadows, and borders to images.",
    keywords: ["border", "frame", "shadow", "stroke", "outline", "photo border", "add frame", "image pe border lagana"] 
  },

  // ==========================================
  // UTILITY TOOLS
  // ==========================================
  { 
    id: "resize", 
    name: "Resize", 
    route: "/tools/resize", 
    category: "utility",
    visual: "⤡",
    description: "Scale images to exact dimensions.",
    keywords: ["resize", "dimensions", "1080", "2000px", "resolution change", "size change", "1080x1080", "photo resize karni hai", "image resize karo", "scale"] 
  },
  { 
    id: "crop", 
    name: "Crop", 
    route: "/tools/crop", 
    category: "utility",
    visual: "◩",
    description: "Crop and reframe photos.",
    keywords: ["crop", "cut image", "reframe", "aspect ratio", "trim", "photo cut", "crop photo", "crop image"] 
  },
  { 
    id: "compressor", 
    name: "Compress", 
    route: "/tools/compressor", 
    category: "utility",
    visual: "⇲",
    description: "Reduce file sizes aggressively.",
    keywords: ["compress", "size kam", "mb kam", "reduce size", "smaller", "photo ka size", "heavy", "comprss", "photo compress karni hai", "image compress karo", "kb kam", "file size"] 
  },
  { 
    id: "convert", 
    name: "Convert", 
    route: "/tools/convert", 
    category: "utility",
    visual: "⇄",
    description: "Convert formats (JPG, PNG, WebP).",
    keywords: ["convert", "format", "jpg", "png", "webp", "change format", "image type", "to png", "to jpg"] 
  },
  { 
    id: "rotate-flip", 
    name: "Rotate", 
    route: "/tools/rotate-flip", 
    category: "utility",
    visual: "↺",
    description: "Rotate or mirror images.",
    keywords: ["rotate", "flip", "mirror", "turn", "ghuma", "rotate image", "flip image", "ulta", "seedha"] 
  },
  { 
    id: "rounded-image", 
    name: "Rounded", 
    route: "/tools/rounded-image", 
    category: "utility",
    visual: "╭╮",
    description: "Transparent curved corners.",
    keywords: ["rounded", "corners", "curved", "border radius", "round image", "gol edge", "rounded corners"] 
  },

  // ==========================================
  // SPECIALIZED TOOLS
  // ==========================================
  { 
    id: "video-editor", 
    name: "Video Editor", 
    route: "/tools/video-editor", 
    category: "specialized",
    visual: "🎬",
    description: "Simple browser-based video editing for quick cuts, trims, crops, text, audio and exports.",
    keywords: [
      "video editor", "edit video", "video editing", "edit a video", 
      "video cut", "video trim", "trim video", "cut video", "crop video", 
      "video ko edit karna hai", "video edit karni hai", "video cut karni hai", 
      "video trim karna hai", "video ka size change karna hai", "mujhe video cut karni hai"
    ] 
  },
  { 
    id: "video-to-gif", 
    name: "Video to GIF Maker", 
    route: "/tools/video-to-gif", 
    category: "specialized",
    visual: "🎞",
    description: "Trim a clip and export a lightweight animated GIF.",
    keywords: ["gif", "video ko gif", "video se gif", "convert to gif", "gif banana", "make gif", "create gif"] 
  },
  { 
    id: "shot-cuts", 
    name: "Hard Cuts", 
    route: "/tools/shot-cuts", 
    category: "specialized",
    visual: "🎬",
    description: "Detect hard cuts in video and extract the first frame of every shot.",
    keywords: ["hard cut", "hard cuts", "scene change", "scene cut", "scene detection", "shots detect", "find cuts", "scenes alag", "kat", "heeeard cut", "video shots", "detect scenes"] 
  },
  { 
    id: "passport-photo", 
    name: "Passport Photo Maker", 
    route: "/tools/passport-photo", 
    category: "specialized",
    visual: "🪪",
    description: "Format to standard ID dimensions.",
    keywords: ["passport", "35x45", "id photo", "passport size", "pasport photo", "visa photo", "official photo"] 
  },
  { 
    id: "color-palette", 
    name: "Color Palette", 
    route: "/tools/color-palette", 
    category: "specialized",
    visual: "🎨",
    description: "Extract dominant hex colors.",
    keywords: ["color palette", "colors nikalo", "colors extract", "palette banao", "dominant colors", "color nikalne", "hex codes", "extract colors"] 
  },
  { 
    id: "image-quality-checker", 
    name: "Quality Checker", 
    route: "/tools/image-quality-checker", 
    category: "specialized",
    visual: "✓",
    description: "Analyze images for web & print suitability.",
    keywords: ["quality checker", "check quality", "image resolution check", "print quality", "web quality", "analyze image", "quality check"] 
  },
  { 
    id: "image-upscaler", 
    name: "Image Upscaler", 
    route: "/tools/image-upscaler", 
    category: "specialized",
    visual: "⤢",
    description: "Increase resolution preserving quality.",
    keywords: ["upscale", "hd karo", "quality improve", "resolution badhao", "2x", "bigger", "enhance", "upscal", "quality badhani", "photo quality improve karni hai", "photo hd karo", "make image better"] 
  },
  { 
    id: "watermark", 
    name: "Watermark", 
    route: "/tools/watermark", 
    category: "specialized",
    visual: "©",
    description: "Apply repeated watermark patterns.",
    keywords: ["watermark", "logo lagana", "photo pe logo lagana hai", "image pe watermark lagana hai", "watermark lagana hai", "add watermark", "protect image"] 
  },
  { 
    id: "check-metadata", 
    name: "Check Metadata", 
    route: "/tools/check-metadata", 
    category: "specialized",
    visual: "ⓘ",
    description: "Inspect image metadata, EXIF, IPTC, XMP and file information.",
    keywords: ["metadata", "exif", "iptc", "xmp", "file info", "image info", "check metadata", "inspect image"] 
  },

  // ==========================================
  // OTHER TOOLS
  // ==========================================
  { 
    id: "metadata-remover", 
    name: "Metadata Remover", 
    route: "/tools/metadata-remover", 
    category: "other",
    visual: "✕",
    description: "Strip EXIF data from photos.",
    keywords: ["metadata", "exif", "strip data", "remove metadata", "exif remover", "delete metadata", "clear exif"] 
  },
  { 
    id: "image-cleanup", 
    name: "Image Cleanup", 
    route: "/tools/image-cleanup", 
    category: "other",
    visual: "✨",
    description: "Remove unwanted elements & dust.",
    keywords: ["remove object", "object hatao", "photo clean", "unwanted", "cleanup", "photo se object hatana hai", "magic eraser", "heal image", "remove person", "spot removal"] 
  },
  { 
    id: "blur", 
    name: "Image Blur", 
    route: "/tools/blur", 
    category: "other",
    visual: "☁",
    description: "Apply gaussian blur effects.",
    keywords: ["blur", "gaussian", "blur image", "dhundhla", "photo blur karna hai", "blur photo", "unfocus"] 
  },
  { 
    id: "pixelate", 
    name: "Pixelate Image", 
    route: "/tools/pixelate", 
    category: "other",
    visual: "■",
    description: "Create 8-bit style pixelation.",
    keywords: ["pixelate", "8-bit", "pixel art", "pixel effect", "pixels", "pixelate image"] 
  },
  { 
    id: "canvas", 
    name: "Canvas / Padding", 
    route: "/tools/canvas", 
    category: "other",
    visual: "⛶",
    description: "Add surrounding padding/margins.",
    keywords: ["canvas", "padding", "margins", "add space", "border space", "white margin", "add canvas"] 
  },
  { 
    id: "grid-cutter", 
    name: "Grid Cutter", 
    route: "/tools/grid-cutter", 
    category: "other",
    visual: "▦",
    description: "Split images into precise grids and export each section individually.",
    keywords: ["grid cutter", "split image", "slice image", "instagram grid", "3x3", "grid slice", "divide image", "cut into pieces"] 
  },
  { 
    id: "meme", 
    name: "Meme Generator", 
    route: "/tools/meme", 
    category: "other",
    visual: "T",
    description: "Add classic impact font text.",
    keywords: ["meme", "meme generator", "impact font", "funny text", "make meme", "meme maker"] 
  },
  { 
    id: "pdf-contact-sheet", 
    name: "Contact Sheet", 
    route: "/tools/pdf-contact-sheet", 
    category: "other",
    visual: "▤",
    description: "Generate multi-image PDF galleries.",
    keywords: ["contact sheet", "pdf gallery", "image to pdf", "pdf grid", "multi image pdf"] 
  },
  { 
    id: "bulk-image-renamer", 
    name: "Bulk Image Renamer", 
    route: "/tools/bulk-image-renamer", 
    category: "other",
    visual: "✎",
    description: "Rename hundreds of images quickly.",
    keywords: ["bulk rename", "rename images", "batch rename", "mass rename", "change names", "bulk namer"] 
  },
  { 
    id: "face-blur", 
    name: "Face Blur", 
    route: "/tools/face-blur", 
    category: "other",
    visual: "👤",
    description: "Auto-detect and blur faces.",
    keywords: ["face blur", "face blur karna hai", "face blur karo", "face ko blur karna hai", "photo me face blur karna hai", "blur face", "blur faces", "faces blur karo", "hide someone's face", "hide face", "person ka face hide karna hai", "photo me face chhupana hai", "चेहरा blur करना है", "anonymize", "hide identity"] 
  },
  { 
    id: "background-remover", 
    name: "Background Remover", 
    route: "/tools/background-remover", 
    category: "other",
    visual: "✂",
    description: "Isolate subjects instantly.",
    keywords: ["remove background", "bg hatao", "background hata do", "remove bg", "background delete", "transparent", "backgroud", "background remove karna hai", "background hatao", "cut out", "isolate subject"] 
  },
  { 
    id: "social-resizer", 
    name: "Social Media Resizer", 
    route: "/tools/social-resizer", 
    category: "other",
    visual: "📱",
    description: "Format for Instagram, YouTube, etc.",
    keywords: ["social media", "instagram size", "youtube thumbnail", "twitter header", "social resize", "social format"] 
  },
  { 
    id: "favicon", 
    name: "Favicon Generator", 
    route: "/tools/favicon", 
    category: "other",
    visual: "◆",
    description: "Create .ico and webapp icons.",
    keywords: ["favicon", "ico", "webapp icon", "website icon", "generate favicon", "favicon maker"] 
  },
  { 
    id: "color-picker", 
    name: "Color Picker", 
    route: "/tools/color-picker", 
    category: "other",
    visual: "💉",
    description: "Sample specific pixels.",
    keywords: ["color picker", "pick a color", "color select karna hai", "image se color nikalna hai", "photo ka color pick karna hai", "extract color", "pick colour from image", "sample color", "eyedropper"] 
  },
  { 
    id: "cinematic-focus", 
    name: "Cinematic Focus", 
    route: "/tools/cinematic-focus", 
    category: "specialized",
    visual: "🎥",
    description: "Complete studio for cinematic focus, film grading, and distressed poster effects.",
    keywords: ["cinematic", "film grading", "distressed poster", "cinematic focus", "focus effect", "film look", "movie look", "vintage film"] 
  },
  { 
    id: "watermark-remover", 
    name: "Watermark Remover", 
    route: "/tools/watermark-remover", 
    category: "other",
    visual: "🧽",
    description: "Content-aware object removal and intelligent image reconstruction.",
    keywords: ["watermark remover", "remove watermark", "delete watermark", "erase watermark", "content aware fill", "reconstruct image", "remove text", "remove logo"] 
  }
];
