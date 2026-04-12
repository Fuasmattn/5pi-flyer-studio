# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Flyer design studio for "Five Pints In" band. No build step, no package manager, no framework. Open `index.html` in a browser to develop.

Deployed to GitHub Pages via `.github/workflows/deploy.yml` at `https://fuasmattn.github.io/5pi-flyer-studio/`.

## Development

There are no build, lint, or test commands. To develop:
- Open `index.html` directly in a browser
- CDN dependencies: JSZip 3.10.1, jsPDF 2.5.1, QR code generator 1.4.4, Google Fonts

## Architecture

The app is split across three files (~1,600 lines total):

1. **`index.html`** (~250 lines) — Slim HTML shell. `<head>` contains font links, CDN scripts, `<link>` to `style.css`, and an inline FOUC-prevention script that reads the theme from IndexedDB before first paint. `<body>` has all markup. Loads `app.js` via `<script defer>`.
2. **`style.css`** (~400 lines) — Full design system using CSS custom properties. Light theme is the `:root` default; dark overrides live in `[data-theme="dark"]`. Brand color `#E63946`. Typography: Epilogue headings, Inter UI. Tokens for surfaces, inputs, borders, radii.
3. **`app.js`** (~950 lines) — All application logic including state management, canvas rendering, persistence, undo/redo, export, and theming.

### Theming

- Light/dark/system preference toggle stored in IndexedDB key `fpi_theme`
- CSS custom properties swap all UI colors; canvas artwork is unaffected
- FOUC prevention: inline `<head>` script reads IndexedDB async, falls back to `prefers-color-scheme`
- `THEME_ORDER = ['light','dark','system']`, cycled via `cycleTheme()`

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

### Persistence (IndexedDB)

- DB name `fpi_studio`, version 1, single object store `kv`
- Raw IndexedDB API — no wrapper library
- Helper functions: `idbGet(k)`, `idbSet(k,v)`, `idbDel(k)`, `dbSet(k,v,label)` (fire-and-forget with quota toast)
- `loadStore()` is async, awaited at init
- Keys: `fpi_draft` (auto-saved state), `fpi_flyers` (saved flyers), `fpi_venues` (venue presets), `fpi_tpls` (templates), `fpi_bandLogo`, `fpi_bgImage`, `fpi_theme`
- Objects stored as structured clones (no JSON.stringify needed)

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
- `cycleTheme()` / `applyTheme()` / `loadTheme()` — theme management

## Conventions

- Variable names are terse: `S` = state, `cv` = canvas, `cx` = context, `pp` = preview pane, `ed` = editor
- Tab switching uses `.ed-panel.on` CSS class toggling
- Mobile breakpoint at 840px — stacks layout vertically with bottom tab bar
- Keyboard shortcuts: Ctrl+Z/Shift+Z undo/redo, Ctrl+S save, Ctrl+E export, 1-4 switch formats
