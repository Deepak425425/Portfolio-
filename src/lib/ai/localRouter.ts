import { TOOL_REGISTRY, RegisteredTool } from "../registry/tools";
export type { RegisteredTool };

export interface IntentMatch {
  tools: RegisteredTool[];
  confidence: 'high' | 'multiple' | 'none';
  customResponse?: string;
  isGreeting?: boolean;
}

export function matchIntent(query: string, messageHistoryContext: string[] = []): IntentMatch {
  const normalizedQuery = query.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, ' ').trim();
  
  if (!normalizedQuery) return { tools: [], confidence: 'none' };
  
  // 1. DATE INTENT (Highest Priority)
  if (normalizedQuery === "date" || 
      normalizedQuery.includes("today date") || 
      normalizedQuery.includes("todays date") || 
      (normalizedQuery.includes("what is") && normalizedQuery.includes("date")) ||
      normalizedQuery.includes("what date is today") || 
      normalizedQuery.includes("aaj ki date") || 
      normalizedQuery.includes("aaj ki tareekh") || 
      normalizedQuery.includes("date kya")) {
    const dateString = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return { tools: [], confidence: 'none', customResponse: `Today is ${dateString}.` };
  }
  if (normalizedQuery.includes("tomorrow")) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return { tools: [], confidence: 'none', customResponse: `Tomorrow is ${dateString}.` };
  }

  // 2. TIME INTENT
  if (normalizedQuery === "time" || 
      normalizedQuery.includes("what time") || 
      normalizedQuery.includes("current time") || 
      normalizedQuery.includes("time kya") || 
      normalizedQuery.includes("kitne baje") || 
      normalizedQuery.includes("abhi kitne baje")) {
    const timeString = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return { tools: [], confidence: 'none', customResponse: `It's ${timeString}.` };
  }

  // 3. WEEKDAY INTENT
  if (normalizedQuery.includes("what day") || 
      normalizedQuery.includes("kaun sa din") || 
      normalizedQuery.includes("todays day")) {
    const dayString = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return { tools: [], confidence: 'none', customResponse: `Today is ${dayString}.` };
  }

  // 4. IDENTITY INTENT
  if (normalizedQuery === "who are you" || normalizedQuery === "what is your name" || normalizedQuery === "who are u") {
    return { tools: [], confidence: 'none', customResponse: "I'm GROTON AI — Deepak's creative assistant for finding and using GROTON tools." };
  }
  if (normalizedQuery === "who is deepak") {
    return { tools: [], confidence: 'none', customResponse: "Deepak is the creator of GROTON AI." };
  }

  // 5. GREETINGS
  const greetings = ["hi", "hello", "hey", "hii", "namaste", "good morning", "good evening", "good afternoon"];
  if (greetings.includes(normalizedQuery)) {
    return { tools: [], confidence: 'none', customResponse: "Hey! What can I help you with?", isGreeting: true };
  }

  // 6. KNOWLEDGE & EXPLICIT TOOL INTENT
  let knowledgeResponse = "";
  let forcedTool: RegisteredTool | null = null;
  
  if (normalizedQuery.includes("what is a hard cut") || normalizedQuery.includes("hard cut kya")) {
    knowledgeResponse = "A hard cut is a direct transition from one shot to another without a gradual transition. Want to detect them in a video?";
    forcedTool = TOOL_REGISTRY.find(t => t.id === "shot-cuts") || null;
  }
  else if (normalizedQuery.includes("what is image compression") || normalizedQuery.includes("compression kya")) {
    knowledgeResponse = "Image compression reduces an image's file size while trying to preserve visual quality. If you want to compress an image, use GROTON Image Compressor.";
    forcedTool = TOOL_REGISTRY.find(t => t.id === "compressor") || null;
  }
  else if (normalizedQuery.includes("what is image upscaling") || normalizedQuery.includes("upscaling kya")) {
    knowledgeResponse = "Image upscaling uses AI to increase the resolution of an image without making it blurry. Want to upscale a photo?";
    forcedTool = TOOL_REGISTRY.find(t => t.id === "image-upscaler") || null;
  }
  else if (normalizedQuery.includes("what is a color palette") || normalizedQuery.includes("color palette kya")) {
    knowledgeResponse = "A color palette is the dominant set of colors extracted from an image, useful for design consistency.";
    forcedTool = TOOL_REGISTRY.find(t => t.id === "color-palette") || null;
  }
  else if (normalizedQuery.includes("what is a gif") || normalizedQuery.includes("gif kya")) {
    knowledgeResponse = "A GIF is an image format that supports short, looping animations without audio.";
    forcedTool = TOOL_REGISTRY.find(t => t.id === "video-to-gif") || null;
  }
  else if (normalizedQuery.includes("what is image resolution") || normalizedQuery.includes("resolution kya")) {
    knowledgeResponse = "Resolution refers to the number of pixels in an image (width × height). Higher resolution means more detail.";
    forcedTool = TOOL_REGISTRY.find(t => t.id === "resize") || null;
  }
  else if (normalizedQuery.includes("what is aspect ratio") || normalizedQuery.includes("aspect ratio kya")) {
    knowledgeResponse = "Aspect ratio is the proportional relationship between an image's width and its height (e.g., 16:9 or 1:1).";
    forcedTool = TOOL_REGISTRY.find(t => t.id === "crop") || null;
  }
  else if (normalizedQuery.includes("what is png") || normalizedQuery.includes("png kya")) {
    knowledgeResponse = "PNG is a high-quality image format that supports transparent backgrounds.";
    forcedTool = TOOL_REGISTRY.find(t => t.id === "convert") || null;
  }
  else if (normalizedQuery.includes("what is jpeg") || normalizedQuery.includes("jpeg kya") || normalizedQuery.includes("what is jpg")) {
    knowledgeResponse = "JPEG is a widely used lossy image format that is great for photos but doesn't support transparency.";
    forcedTool = TOOL_REGISTRY.find(t => t.id === "convert") || null;
  }
  else if (normalizedQuery.includes("what is webp") || normalizedQuery.includes("webp kya")) {
    knowledgeResponse = "WebP is a modern image format providing superior compression and quality for web images compared to JPEG and PNG.";
    forcedTool = TOOL_REGISTRY.find(t => t.id === "convert") || null;
  }

  if (knowledgeResponse && forcedTool) {
    return { tools: [forcedTool], confidence: 'high', customResponse: knowledgeResponse };
  }

  // 7. NORMAL TOOL ROUTING (Fuzzy matching)
  const scores = TOOL_REGISTRY.map(tool => {
     let score = 0;
     if (normalizedQuery.includes(tool.name.toLowerCase())) score += 100;
     
     const queryWords = normalizedQuery.split(' ');
     
     // Keyword exact matching first
     for (const kw of tool.keywords) {
       const normKw = kw.toLowerCase();
       if (normalizedQuery.includes(normKw)) {
         score += 80; // Boosted keyword match
       } else {
         const kwWords = normKw.split(' ');
         for (const qw of queryWords) {
           for (const kww of kwWords) {
             if (qw.length >= 4 && kww.length >= 4) {
               if (qw.includes(kww) || kww.includes(qw)) score += 20;
             }
           }
         }
       }
     }
     
     // Description semantic matching
     const descWords = tool.description.toLowerCase().replace(/[^\w\s]/gi, '').split(' ');
     for (const qw of queryWords) {
        if (qw.length > 3 && descWords.includes(qw)) {
           score += 15;
        }
     }

     if (tool.id === "shot-cuts") {
       if (normalizedQuery.includes("hard") || normalizedQuery.includes("kat") || normalizedQuery.includes("cut") || normalizedQuery.includes("heard") || normalizedQuery.includes("heeeard")) {
         if (normalizedQuery.includes("video") || normalizedQuery.includes("scene") || normalizedQuery.includes("shot")) score += 80;
         if (normalizedQuery.includes("kat")) score += 50;
         if (normalizedQuery.includes("heeeard")) score += 50;
       }
     }
     
     return { tool, score };
  });
  
  const matches = scores.filter(s => s.score > 25).sort((a, b) => b.score - a.score);
  
  if (matches.length > 0) {
    if (matches.length === 1 || (matches[0].score > matches[1].score + 40)) {
       return { tools: [matches[0].tool], confidence: 'high' };
    }
    return { tools: matches.slice(0, 3).map(m => m.tool), confidence: 'multiple' };
  }

  // 8. UNKNOWN
  return { 
    tools: [], 
    confidence: 'none', 
    customResponse: "I don't have that information built into GROTON AI yet.\n\nTry asking me about GROTON tools, basic image/video concepts, or date and time." 
  };
}
