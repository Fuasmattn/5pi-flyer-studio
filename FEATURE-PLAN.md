# Five Pints In — Flyer Studio Feature Plan

**Created:** 7 April 2026
**Last updated:** 7 April 2026

---

## Existing Features (pre-v5)

- [x] Visual flyer builder with real-time Canvas 2D preview
- [x] 4 export formats: IG Post (1080x1080), IG Story (1080x1920), FB Event (1200x628), A5 Print (1748x2480)
- [x] Background image upload with darken/blur/fit controls
- [x] Band logo + venue logo with size/X/Y positioning
- [x] Text layout controls (size + Y position for band name, date, venue block)
- [x] 9 procedural background styles (Plain, Smoke, Spotlights, Grunge, Neon Grid, Embers, Bokeh, Molten, Halftone)
- [x] Background style color variants (red, blue, purple, green, orange, pink, cyan, white)
- [x] Image filters on backgrounds (grayscale, sepia, high contrast, saturate, hue rotate, dark grit)
- [x] Overlay style on image with opacity control
- [x] Font selection per text element (Bebas Neue, Anton, Oswald, Montserrat, Poppins, Playfair Display, Permanent Marker)
- [x] Text color swatches per element (10 color options)
- [x] Venue presets (save/load)
- [x] Saved flyers with localStorage persistence
- [x] Social media handles with Instagram/Facebook icon toggle
- [x] Image URL loading (paste URL for logos and backgrounds)
- [x] PNG export with smart filenames

---

## New Features (v5) — All Implemented

### Priority 1 — Undo / Redo [DONE]
- 30-state history stack tracking all form changes
- Undo/redo buttons in header (disabled when at stack boundary)
- Ctrl+Z / Ctrl+Shift+Z keyboard shortcuts
- Preserves image data-URLs across undo/redo (only serializes non-image state)

### Priority 2 — Batch Export (Download All) [DONE]
- "Download All" button renders all 4 formats + A5 PDF into a single ZIP file
- Uses JSZip (CDN) for archive creation
- Progress toast during rendering ("Rendering 2/4...")
- Smart filenames: `{band}_{venue}_{date}_all-formats.zip`

### Priority 3 — Template System [DONE]
- "Templates" button in header opens dedicated modal
- "Save current as template" strips gig-specific fields (date, doors, price, venue, address, social, QR)
- Loading a template preserves the band logo
- Templates stored separately in localStorage (`fpi_tpls`)
- Delete templates from modal

### Priority 4 — Color Theme Picker [ALREADY EXISTED]
- Background style color variants were already implemented in v4
- Text color swatches per element were already implemented in v4
- No additional work needed

### Priority 5 — Keyboard Shortcuts [DONE]
- Ctrl+Z — Undo
- Ctrl+Shift+Z — Redo
- Ctrl+S — Save flyer
- Ctrl+E — Export current format (PNG)
- Ctrl+Shift+E — Export all formats (ZIP)
- Ctrl+Shift+C — Copy to clipboard
- 1/2/3/4 keys — Switch format tabs (when not typing in input)
- "?" button in header shows shortcuts cheatsheet modal

### Priority 6 — Duplicate Flyer [DONE]
- "Dup" button on each saved flyer in the modal
- Creates copy with "(Copy)" suffix, blanks date/doors/price
- Re-renders flyer list immediately

### Priority 7 — PDF Export for Print [DONE]
- "Download PDF" button visible when A5 format is selected
- Uses jsPDF (CDN) to create single-page A5 PDF (148x210mm)
- JPEG compression at 92% quality for reasonable file size
- Also included automatically in batch export ZIP

### Priority 8 — QR Code on Flyer [DONE]
- URL input in Gig Details section
- QR code position/size controls appear when URL is entered
- Built-in QR matrix generator (byte mode, version 1-6, EC level L)
- Rendered on canvas with white rounded-rect background + padding
- Positioned using same percentage-based system as logos

### Priority 9 — Text Color Overrides [ALREADY EXISTED]
- Color swatches per text element were already implemented in v4
- No additional work needed

### Priority 10 — Background Image Reposition (Pan) [DONE]
- Pan X / Pan Y sliders shown when background image is loaded with fit=cover
- Modifies the source crop offset in the cover algorithm
- Default 50/50 = center crop (same as before)

### Priority 11 — Copy to Clipboard [DONE]
- "Copy" button in action bar
- Renders full-resolution canvas → PNG blob → Clipboard API
- Fallback toast if browser doesn't support clipboard write
- Works with Ctrl+Shift+C shortcut

### Priority 12 — Preview Zoom [DONE]
- Scroll wheel over canvas to zoom (1x to 4x range)
- Click-drag to pan when zoomed in
- Double-click to reset zoom
- Zoom percentage badge shows in top-right when zoomed
- Cursor changes to grab/grabbing when zoomed

### Mobile Responsiveness [DONE]
- Editor/Preview tab toggle at top (switches between panels on small screens)
- Breakpoint at 840px: stacked vertical layout, full-width editor and preview
- Enlarged touch targets: bigger slider thumbs (20px), larger input fields, bigger color swatches (24px), bigger social icon buttons
- Pinch-to-zoom on preview canvas (two-finger gesture)
- Touch drag-to-pan when zoomed in
- Compact header: abbreviated button labels, hidden "Flyer Studio" subtitle
- Full-width modals on mobile
- Scrollable format bar for horizontal overflow
- Extra-compact layout at 420px for narrow phones
- Toast notification positioned higher to avoid thumb interference

---

## Technical Summary

- **Architecture:** Single self-contained HTML file (no build step)
- **File size:** ~1,300 lines (up from ~620 in v4)
- **External CDN libraries:** JSZip (batch export), jsPDF (PDF export), Google Fonts
- **No framework:** Vanilla JS + Canvas 2D + localStorage
- **QR generation:** Built-in byte-mode encoder (no external library)
