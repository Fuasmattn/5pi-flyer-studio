# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Single-file flyer design studio for "Five Pints In" band. The entire app lives in `index.html` — no build step, no package manager, no framework. Open in a browser to develop.

Deployed to GitHub Pages via `.github/workflows/deploy.yml` at `https://fuasmattn.github.io/5pi-flyer-studio/`.

## Development

There are no build, lint, or test commands. To develop:
- Open `index.html` directly in a browser
- Edit the single HTML file — all CSS, HTML, and JS are inline
- CDN dependencies: JSZip 3.10.1, jsPDF 2.5.1, QR code generator 1.4.4, Google Fonts

## Architecture

The app is a ~1,400-line single HTML file with three sections:

1. **CSS** (top) — Dark theme design system with brand color `#E63946`. Uses CSS custom properties for surface tiers, roundness tokens, and typography (Epilogue headings, Inter UI).
2. **HTML** (middle) — Left sidebar editor with 3 tabs (Content, Scene/Background, Style), right canvas preview pane, modals for saved flyers/templates/shortcuts.
3. **JavaScript** (bottom) — All application logic.

### State & Rendering

- Single global state object `S` with ~28 properties (band name, date, venue, colors, positions, etc.)
- Defaults defined in `DFLT` object
- All input changes flow through `schedRender()` (50ms debounce) which re-draws the canvas
- Three input binding arrays: `TF` (text fields), `RF` (range sliders), `SF` (selects)

### Canvas Rendering

- Canvas 2D API with `devicePixelRatio` scaling for high-DPI
- 9 procedural background styles (Smoke, Spotlights, Grunge, Neon Grid, etc.) generated algorithmically — no image assets
- Background cache: `bgCC = {k, c}` avoids regenerating unchanged backgrounds
- Image cache: `imgCache` keyed by data-URL avoids re-decoding
- Rendering pipeline: background → image → border → text blocks → QR code → vignette/noise overlay

### Persistence (localStorage)

- `fpi_draft` — auto-saved current state on every change
- `fpi_flyers` — explicitly saved flyers
- `fpi_venues` — venue presets
- `fpi_tpls` — templates (gig-specific fields stripped)
- Images stored as base64 data-URLs (quota-aware with error handling)

### Undo/Redo

- History stack (`hist[]`, max 30 states) with JSON serialization
- Image data-URLs excluded from history cloning to save memory
- Pause mechanism during navigation to prevent re-recording

### Export

- 4 formats in `FMT` object: IG Post (1080×1080), IG Story (1080×1920), FB Event (1200×628), A5 Print (1748×2480)
- Single PNG, batch ZIP (all formats + A5 PDF), clipboard copy
- PDF via jsPDF at 92% JPEG quality, 148×210mm

### Key Functions

- `render()` — main canvas draw loop
- `schedRender()` — debounced render trigger
- `pushHist()` / `undo()` / `redo()` — history management
- `exportFlyer()` / `exportAll()` — export pipeline
- `gI()` — lazy image loader with cache
- `drawBorder()` — 6 border style renderer
- `genBg()` — procedural background generator

## Conventions

- Variable names are terse (single-file constraint): `S` = state, `cv` = canvas, `cx` = context, `pp` = preview pane, `ed` = editor
- Tab switching uses `.ed-panel.on` CSS class toggling
- Mobile breakpoint at 840px — stacks layout vertically with bottom tab bar
- Keyboard shortcuts: Ctrl+Z/Shift+Z undo/redo, Ctrl+S save, Ctrl+E export, 1-4 switch formats
