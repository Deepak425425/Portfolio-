# GROTON AI Tools Inventory

## Phase 1 & 2: Complete Inventory & Categorization

| Order | Tool | Route | Current Section | Recommended Category | Functionality | Status |
|------|------|-------|-----------------|----------------------|---------------|--------|
| 1 | Image Compare | `/tools/image-compare` | Featured | FEATURED | Compare two images side-by-side or slider | Fully Functional |
| 2 | Collage Maker | `/tools/collage` | Featured | FEATURED | Combine images into grid layouts | Fully Functional |
| 3 | Image Filters & Grade | `/tools/filters` | Featured | IMAGE TOOLS | Apply creative color grading filters | Fully Functional |
| 4 | Background Remover | `/tools/background-remover` | Other | SPECIALIZED / AI | Remove backgrounds instantly using AI | Fully Functional |
| 5 | Image Cleanup | `/tools/image-cleanup` | Other | SPECIALIZED / AI | Heal/remove unwanted objects (content-aware) | Fully Functional |
| 6 | Resize | `/tools/resize` | Utility | IMAGE TOOLS | Scale image dimensions | Fully Functional |
| 7 | Crop | `/tools/crop` | Utility | IMAGE TOOLS | Crop/trim image to aspect ratio | Fully Functional |
| 8 | Compress | `/tools/compressor` | Utility | IMAGE TOOLS | Reduce image file size (mb/kb) | Fully Functional |
| 9 | Convert | `/tools/convert` | Utility | IMAGE TOOLS | Change formats (PNG, WebP, JPG) | Fully Functional |
| 10 | Rotate | `/tools/rotate-flip` | Utility | IMAGE TOOLS | Rotate or flip/mirror image | Fully Functional |
| 11 | Rounded | `/tools/rounded-image` | Utility | IMAGE TOOLS | Add rounded corners to image | Fully Functional |
| 12 | Canvas / Padding | `/tools/canvas` | Other | IMAGE TOOLS | Add padding/canvas margins around image | Fully Functional |
| 13 | Grid Cutter | `/tools/grid-cutter` | Other | IMAGE TOOLS | Split image into a grid (e.g., Instagram) | Fully Functional |
| 14 | Color Palette | `/tools/color-palette` | Specialized | IMAGE TOOLS | Extract dominant hex colors from image | Fully Functional |
| 15 | Color Picker | `/tools/color-picker` | Other | IMAGE TOOLS | Pick specific pixel colors (eyedropper) | Fully Functional |
| 16 | Image Blur | `/tools/blur` | Other | IMAGE TOOLS | Apply gaussian blur | Fully Functional |
| 17 | Pixelate Image | `/tools/pixelate` | Other | IMAGE TOOLS | 8-bit pixelation effect | Fully Functional |
| 18 | Watermark | `/tools/watermark` | Specialized | IMAGE TOOLS | Overlay watermark pattern | Fully Functional |
| 19 | Social Media Resizer | `/tools/social-resizer` | Other | IMAGE TOOLS | Format for social platform dimensions | Fully Functional |
| 20 | Passport Photo Maker | `/tools/passport-photo` | Specialized | IMAGE TOOLS | Format to standard ID dimensions | Fully Functional |
| 21 | Favicon Generator | `/tools/favicon` | Other | IMAGE TOOLS | Generate .ico and webapp icons | Fully Functional |
| 22 | Meme Generator | `/tools/meme` | Other | IMAGE TOOLS | Add Impact font overlay | Fully Functional |
| 23 | Video Editor | `/tools/video-editor` | Specialized | VIDEO TOOLS | In-browser trim, crop, edit video | Fully Functional |
| 24 | Video to GIF Maker | `/tools/video-to-gif` | Specialized | VIDEO TOOLS | Trim video and export GIF | Fully Functional |
| 25 | Video Compress | `/tools/video-compress` | Specialized | VIDEO TOOLS | Reduce video file size | Fully Functional |
| 26 | Video Compare | `/tools/video-compare` | Featured | VIDEO TOOLS | Visually compare two videos | Fully Functional |
| 27 | Video Audio Swap | `/tools/video-audio-swap` | Specialized | VIDEO TOOLS | Replace or mix audio tracks on video | Fully Functional |
| 28 | Shot Cuts | `/tools/shot-cuts` | Specialized | VIDEO TOOLS | Detect hard cuts and extract frames | Fully Functional |
| 29 | Audio Splicer | `/tools/audio-splicer` | Specialized | AUDIO TOOLS | Edit, merge, mix audio natively | Fully Functional |
| 30 | Contact Sheet | `/tools/pdf-contact-sheet` | Other | PDF & DOCUMENT TOOLS | Generate multi-image PDF galleries | Fully Functional |
| 31 | Check Metadata | `/tools/check-metadata` | Specialized | FILE & METADATA | Inspect EXIF/IPTC data | Fully Functional |
| 32 | Metadata Remover | `/tools/metadata-remover` | Other | FILE & METADATA | Strip EXIF data | Fully Functional |
| 33 | Quality Checker | `/tools/image-quality-checker` | Specialized | FILE & METADATA | Analyze image for print/web quality | Fully Functional |
| 34 | Bulk Image Renamer | `/tools/bulk-image-renamer` | Other | FILE & METADATA | Rename images in batch | Fully Functional |
| 35 | Image Upscaler | `/tools/image-upscaler` | Specialized | SPECIALIZED / AI | Increase resolution via upscaling | Fully Functional |
| 36 | Face Blur | `/tools/face-blur` | Other | SPECIALIZED / AI | Auto-detect and blur faces | Fully Functional |
| 37 | Cinematic Focus | `/tools/cinematic-focus` | Specialized | SPECIALIZED / AI | Cinematic grading and focus effect | Fully Functional |
| 38 | Watermark Remover | `/tools/watermark-remover` | Other | SPECIALIZED / AI | Content-aware watermark erasing | Fully Functional |
| 39 | Hard Cut Motion Prompt | `/tools/hard-cut-motion-prompt` | Specialized | SPECIALIZED / AI | Extract motion reference sheets from video | Fully Functional |

## Phase 3: Misplaced / Duplicate / Confusing Tools

1. **Before & After (`/tools/before-after`)**
   - **Status:** Unregistered route, duplicate functionality.
   - **Issue:** Functionally identical to `/tools/image-compare`. Not in public registry, but directory exists.
2. **Split (`/tools/split`)**
   - **Status:** Redirect route.
   - **Issue:** Redirects to `/tools/grid-cutter`. Not a real tool, just an alias.
3. **Add Text to Image (`add-text`)**
   - **Status:** Planned tool in registry.
   - **Issue:** Route is `null`. Should not be shown publicly yet.
4. **Testing Lab Isolation**
   - `Script Board`, `Price Calculator`, and `Image Border` properly reside in `/testing/...` and are not exposed in the public `TOOL_REGISTRY`.

## Phase 4: Recommended User-Friendly Order

Based on the actual utility of each category:

**FEATURED**
- Image Compare
- Collage Maker
- Background Remover
- Video Editor

**IMAGE TOOLS**
- Resize
- Crop
- Compress
- Convert
- Rotate
- Rounded
- Canvas / Padding
- Grid Cutter
- Social Media Resizer
- Passport Photo Maker
- Image Filters & Grade
- Image Blur
- Pixelate Image
- Color Palette
- Color Picker
- Watermark
- Favicon Generator
- Meme Generator

**VIDEO TOOLS**
- Video Editor
- Video to GIF Maker
- Video Compress
- Video Compare
- Video Audio Swap
- Shot Cuts

**AUDIO TOOLS**
- Audio Splicer

**PDF & DOCUMENT TOOLS**
- Contact Sheet

**FILE & METADATA**
- Check Metadata
- Metadata Remover
- Quality Checker
- Bulk Image Renamer

**SPECIALIZED / AI**
- Image Upscaler
- Image Cleanup
- Background Remover (Shortcut)
- Watermark Remover
- Face Blur
- Cinematic Focus
- Hard Cut Motion Prompt
