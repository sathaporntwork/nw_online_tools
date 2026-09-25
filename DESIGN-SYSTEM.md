# 🎨 Design System — Dark Glassmorphism Specification

> **Universal UI/UX Design System Specification**
> A production-ready, dependency-free design system for modern web applications. Built on pure HTML, CSS, and JavaScript with a sleek dark glassmorphism aesthetic, fluid responsiveness, and high-performance micro-interactions.
> **Scope**: Tokens, background architecture, component recipes, accessibility standards, responsive grid strategies, interaction patterns, and debugging guidelines.
> **Goal**: Plug-and-play architectural foundation for any web project without framework lock-in or heavyweight runtimes.

---

## 1. Design Principles

| Principle | Technical Implementation |
|---|---|
| **Dark Glass + Unified Accent Triad** | Deep near-black canvas coupled with frosted glass surfaces and a cohesive triad accent palette (Teal → Violet → Pink) applied consistently across all interactive surfaces. |
| **Depth Without Visual Noise** | Multi-layered `backdrop-filter: blur()`, low-alpha translucent borders, and soft diffuse drop-shadows create spatial elevation while preserving high text contrast and legibility. |
| **Semantic Gradient Hierarchy** | Gradients communicate state, hierarchy, and affordance (progress completion, active navigation, primary CTAs, key statistics) rather than passive decoration. |
| **Content-First Architecture** | Glass containers remain unobtrusive frames; layout hierarchy is governed by disciplined typography scale, strict contrast tiers, and intentional whitespace. |
| **Disciplined Motion System** | Micro-interactions span 0.15s–0.5s utilizing smooth custom cubic-bezier curves, paired with mandatory `prefers-reduced-motion` fallbacks across the entire DOM tree. |
| **Universal Typography** | System-native font stack prioritizing optical legibility, high DPI clarity, and zero layout shift on cold loads. |

---

## 2. Design Tokens (CSS Custom Properties)

Place these tokens at the root of your global stylesheet:

```css
:root {
  /* Canvas & Surfaces */
  --bg: #0e1117;            /* Primary dark background canvas */
  --bg2: #141922;           /* Elevated surface (dropdowns, modals, mobile menus) */

  /* Typography / Text Tiers */
  --ink: #eef2f8;           /* Primary text (high contrast, ~15:1) */
  --ink-dim: #a6b0c0;       /* Secondary text & labels (~8:1) */
  --ink-faint: #7d8899;     /* Tertiary / metadata / captions (~4.6:1) */

  /* Brand Accent Triad & Soft Text Variants */
  --teal: #2fe0bf;
  --violet: #8b5cf6;
  --pink: #ff6ac2;
  --teal-soft: #5eead4;
  --violet-soft: #a78bfa;
  --pink-soft: #fb92d0;

  /* Gradients */
  --grad:      linear-gradient(120deg, var(--teal) 0%, var(--violet) 55%, var(--pink) 100%);
  --grad-soft: linear-gradient(120deg, var(--teal-soft) 0%, var(--violet-soft) 55%, var(--pink-soft) 100%);

  /* Glassmorphism Fill Surfaces (White Alpha) */
  --glass:   rgba(255, 255, 255, 0.055);  /* Standard card surface */
  --glass-2: rgba(255, 255, 255, 0.09);   /* Elevated / hover state surface */
  --glass-3: rgba(255, 255, 255, 0.02);   /* Gradient card bottom falloff */

  /* Borders & Dividers */
  --line:      rgba(255, 255, 255, 0.13); /* Prominent borders (hover, menu frames) */
  --line-soft: rgba(255, 255, 255, 0.08); /* Standard subtle borders */

  /* Semantic Feedback States */
  --ok: #34d399;    /* Success / operational */
  --err: #fb7185;   /* Error / danger */
  --warn: #fbbf24;  /* Warning / caution */

  /* Border Radii */
  --r-lg: 22px;     /* Outer card frames */
  --r-md: 16px;     /* Nested containers & panels */
  --r-sm: 11px;     /* Small elements, badges, inputs */

  /* Elevation & Shadows */
  --shadow:      0 24px 70px rgba(0, 0, 0, 0.45);  /* Modals, popovers, dropdowns */
  --shadow-soft: 0 10px 34px rgba(0, 0, 0, 0.3);   /* Standard glass cards */

  /* Header Dimension */
  --head-h: 66px;   /* Sticky header height — used for scroll offset calculations */

  /* Typography Stacks */
  --font: "Segoe UI Variable Display", "Segoe UI", system-ui, -apple-system,
          BlinkMacSystemFont, "Helvetica Neue", Roboto, sans-serif;
  --mono: ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, "IBM Plex Mono", monospace;
}
```

### Gradient Usage Rules

| Gradient Variant | Color Mapping | Intended Usage |
|---|---|---|
| **Vibrant (`--grad`)** | `Teal → Violet → Pink` | Progress indicators, SVG circular rings, icon backgrounds, focus halos |
| **Soft (`--grad-soft`)** | Soft triad hues | **Gradient Text**: Metric counters, hero highlights, logo accents |
| **Primary Action (CTA)** | `#17b99a → #7c4cf0 → #e455ac` | High-priority interactive triggers & badges (high contrast over dark canvas) |

**Primary Button Highlight Detail**:
`box-shadow: 0 10px 28px -8px rgba(139,92,246,.55), inset 0 1px 0 rgba(255,255,255,.25)` produces an authentic physical glass bevel edge on the top border.

---

## 3. Background Architecture (3-Layer Depth System)

```html
<div class="bg" aria-hidden="true">
  <span class="orb orb-a"></span>
  <span class="orb orb-b"></span>
  <span class="orb orb-c"></span>
  <span class="bg-grid"></span>
</div>
```

```css
/* Layer 1: Fixed base gradient with radial corner ambient glow */
.bg {
  position: fixed;
  inset: 0;
  z-index: -2;
  overflow: hidden;
  background:
    radial-gradient(1100px 520px at 85% -10%, rgba(139, 92, 246, 0.14), transparent 60%),
    radial-gradient(900px 480px at -10% 12%, rgba(47, 224, 191, 0.09), transparent 60%),
    radial-gradient(1000px 600px at 50% 115%, rgba(255, 106, 194, 0.07), transparent 60%),
    linear-gradient(180deg, #0d1016 0%, #0e1117 55%, #0b0e14 100%);
}

/* Layer 2: Asynchronous drifting ambient orbs */
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.5;
  will-change: transform;
}

.orb-a {
  width: 480px; height: 480px;
  left: -140px; top: -160px;
  background: radial-gradient(circle, rgba(47, 224, 191, 0.32), transparent 70%);
  animation: drift 26s ease-in-out infinite alternate;
}

.orb-b {
  width: 560px; height: 560px;
  right: -180px; top: 8%;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.3), transparent 70%);
  animation: drift 32s ease-in-out infinite alternate-reverse;
}

.orb-c {
  width: 520px; height: 520px;
  left: 30%; bottom: -260px;
  background: radial-gradient(circle, rgba(255, 106, 194, 0.2), transparent 70%);
  animation: drift 38s ease-in-out infinite alternate;
}

@keyframes drift {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  100% { transform: translate3d(60px, 40px, 0) scale(1.12); }
}

/* Layer 3: Faint geometric grid with elliptical radial mask */
.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 46px 46px;
  mask-image: radial-gradient(ellipse 90% 60% at 50% 0%, #000 10%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse 90% 60% at 50% 0%, #000 10%, transparent 75%);
}
```

> 💡 **Design Tip**: Using distinct animation durations (26s, 32s, 38s) combined with `alternate-reverse` prevents harmonic repetition, ensuring ambient motion remains subtle and organic.

---

## 4. Typography Scale & Hierarchy

| Level | Size / Weight | Usage |
|---|---|---|
| **Body** | 16px / line-height: 1.65 / regular | Default body copy, paragraphs, documentation |
| **Display H1** | `clamp(2rem, 4.4vw, 3.15rem)` / weight: 800 | Hero title, primary landing header |
| **Section H2** | `clamp(1.5rem, 3vw, 2rem)` / weight: 750 | Section titles, feature category headers |
| **Card H3** | 1.12rem / weight: 700 | Component card titles, modal headers |
| **Eyebrow** | 13px / weight: 800 / `letter-spacing: .12em` / uppercase | Category badges positioned directly above headers |
| **Meta / Caption** | 12.5px–13.5px / `--ink-faint` | Timestamps, counts, secondary hints, table headers |

**Rules**:
- Headings require tight tracking: `line-height: 1.25; letter-spacing: -0.01em;`.
- Top-level headers utilize CSS `clamp()` for responsive fluidity without abrupt jumps.
- Primary quantitative metrics use gradient text styling (19px–44px, weight: 800–850).

### Gradient Text Recipe

```css
.grad-text {
  background: var(--grad-soft);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: inline-block;
}
```

---

## 5. Component Library & Recipes

### 5.1 Glass Card — Base Container

```css
.glass {
  background: linear-gradient(165deg, var(--glass) 0%, var(--glass-3) 100%);
  border: 1px solid var(--line-soft);
  backdrop-filter: blur(18px) saturate(1.15);
  -webkit-backdrop-filter: blur(18px) saturate(1.15);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-soft);
}
```

**Interactive Card Elevation & Border Highlight**:

```css
.card {
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.card:hover {
  transform: translateY(-5px);             /* Major cards: -5px; compact tiles: -2px */
  border-color: rgba(255, 255, 255, 0.22); /* Enhanced specular edge */
  box-shadow: var(--shadow);               /* Deepened elevation */
}

/* Subtle corner ambient reflection */
.card::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(420px 220px at 85% -20%, rgba(139, 92, 246, 0.16), transparent 65%);
}
```

---

### 5.2 Buttons — Pill Geometry

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 999px;
  padding: 10px 22px;
  font-size: 14.5px;
  font-weight: 650;
  line-height: 1.2;
  border: 1px solid transparent;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease,
              border-color 0.2s ease, color 0.2s ease;
  white-space: nowrap;
  user-select: none;
}

.btn:active {
  transform: translateY(1px) scale(0.99); /* Tactile press feedback */
}

/* Primary Gradient CTA */
.btn-primary {
  color: #fff;
  background: linear-gradient(120deg, #17b99a 0%, #7c4cf0 58%, #e455ac 100%);
  box-shadow: 0 10px 28px -8px rgba(139, 92, 246, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 34px -8px rgba(139, 92, 246, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

/* Ghost / Secondary Button */
.btn-ghost {
  color: #fff;
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.38);
}

.btn-ghost:hover {
  border-color: rgba(255, 255, 255, 0.75);
  background: rgba(255, 255, 255, 0.09);
}

/* Sizing Modifiers */
.btn-sm { padding: 7px 15px; font-size: 13px; }
.btn-lg { padding: 13px 30px; font-size: 16px; }

.btn[disabled],
.btn:disabled {
  opacity: 0.42;
  cursor: not-allowed;
  pointer-events: none;
}
```

---

### 5.3 Pills, Chips & Status Badges

All badges and metadata chips adhere to full pill rounding (`border-radius: 999px`).

```css
/* Generic Context Chip */
.k-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  font-weight: 750;
  padding: 5px 12px;
  border-radius: 999px;
  border: 1px solid var(--line-soft);
  background: rgba(255, 255, 255, 0.05);
  color: var(--ink-dim);
}

/* Live Status Kicker (Above H1) */
.hero-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  color: var(--teal-soft);
  background: rgba(47, 224, 191, 0.08);
  border: 1px solid rgba(47, 224, 191, 0.28);
}

.hero-kicker .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--teal);
  box-shadow: 0 0 10px var(--teal);
  animation: pulse 2.2s ease infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
```

**Unified 3-Alpha Status Formula**:
Derive text, border, and background from a single root hue using calibrated opacity steps:

| Status Tier | Text Color | Border (`alpha: 0.40–0.45`) | Background (`alpha: 0.08–0.12`) |
|---|---|---|---|
| **Active / Success** | `#6ee7b7` | `rgba(52, 211, 153, 0.4)` | `rgba(52, 211, 153, 0.08)` |
| **Warning / Preview** | `#fcd34d` | `rgba(251, 191, 36, 0.4)` | `rgba(251, 191, 36, 0.08)` |
| **Accent / Premium** | `#f9a8d4` | `rgba(255, 106, 194, 0.45)` | `rgba(255, 106, 194, 0.1)` |
| **Info / Advanced** | `#c4b5fd` | `rgba(167, 139, 250, 0.45)` | `rgba(139, 92, 246, 0.12)` |

---

### 5.4 Icon Tile — Rounded Backlit Badge

```css
.icon-tile {
  position: relative;
  width: 54px;
  height: 54px;
  border-radius: 15px;
  display: grid;
  place-items: center;
  background: linear-gradient(160deg, rgba(47, 224, 191, 0.16), rgba(139, 92, 246, 0.16) 55%, rgba(255, 106, 194, 0.14));
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 6px 20px -6px rgba(0, 0, 0, 0.5);
}

.icon-tile svg {
  width: 52%;
  height: 52%;
}

/* Ambient backlight halo */
.icon-tile::before {
  content: "";
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.35), transparent 70%);
  filter: blur(14px);
  opacity: 0.7;
  transition: opacity 0.25s ease;
}

.card:hover .icon-tile::before {
  opacity: 1;
}
```

---

### 5.5 Progress Indicators — Circular Ring & Bar

**Mathematical SVG Circular Ring**:
Formula: Circumference C = 2 * pi * r.
Offset calculation: stroke-dashoffset = C * (1 - percentage).

```html
<!-- Compact Circular Gauge: viewBox 40×40, r=16.5 -> C ≈ 103.67 -->
<svg viewBox="0 0 40 40" style="transform: rotate(-90deg)" class="progress-ring">
  <circle class="ring-bg" cx="20" cy="20" r="16.5" />
  <circle class="ring-fill" cx="20" cy="20" r="16.5" id="ringFill" />
</svg>
```

```css
.ring-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.12);
  stroke-width: 4;
}

.ring-fill {
  fill: none;
  stroke: url(#gBrand);
  stroke-width: 4;
  stroke-linecap: round;
  stroke-dasharray: 103.67;
  stroke-dashoffset: 103.67;
  transition: stroke-dashoffset 0.6s ease;
}

/* Large Gauge Metric (e.g. 120px): r=54 -> C ≈ 339.3, stroke-width: 9, transition: 0.9s */
```

**Linear Progress Bar**:

```css
.bar {
  height: 8px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.09);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  width: 0%;
  border-radius: 99px;
  background: var(--grad);
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.6);
  transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
```

---

### 5.6 Code Blocks & Syntax Highlighting

```html
<div class="codeblock">
  <div class="cb-head">
    <span class="cb-dots"><i></i><i></i><i></i></span>
    <span class="cb-title">Terminal / Command</span>
    <button class="cb-copy" type="button">Copy</button>
  </div>
  <pre><code><span class="cmd">curl</span> <span class="flag">-X</span> GET <span class="str">https://api.example.com/v1/health</span></code></pre>
</div>
```

```css
.codeblock {
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #0a0d13;
  box-shadow: var(--shadow-soft);
}

.cb-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 16px;
  background: rgba(255, 255, 255, 0.035);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.cb-dots { display: flex; gap: 6px; }
.cb-dots i { width: 9px; height: 9px; border-radius: 50%; }
.cb-dots i:nth-child(1) { background: rgba(255, 106, 194, 0.7); } /* Pink */
.cb-dots i:nth-child(2) { background: rgba(255, 200, 90, 0.7); }  /* Amber */
.cb-dots i:nth-child(3) { background: rgba(47, 224, 191, 0.7); }  /* Teal */

.cb-title { font-size: 12.5px; color: var(--ink-faint); font-family: var(--mono); }
.cb-copy {
  margin-left: auto;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid var(--line-soft);
  color: var(--ink-dim);
  font-size: 11.5px;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
}

.codeblock pre {
  margin: 0;
  padding: 14px 18px;
  overflow-x: auto;
  font-size: 13.5px;
  line-height: 1.7;
  font-family: var(--mono);
  color: #cfe0ee;
}
```

**Syntax Palette**:
- Comments (`.cmt`): `#6b7686` (italic)
- Primary Commands / Keywords (`.cmd`): `#5eead4` (bold)
- Flags & Options (`.flag`): `#c4b5fd`
- Strings (`.str`): `#fb92d0`
- Numerics (`.num`): `#fcd34d`
- **Inline Code Tag**: `background: rgba(139, 92, 246, 0.14); color: var(--violet-soft); border: 1px solid rgba(139, 92, 246, 0.22); border-radius: 5px; padding: 2px 6px;`

---

### 5.7 Semantic Callouts

```css
.callout {
  display: flex;
  gap: 14px;
  margin: 18px 0;
  padding: 15px 18px;
  border-radius: 14px;
  font-size: 14.5px;
  line-height: 1.6;
}

.callout b {
  display: block;
  margin-bottom: 2px;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.callout.tip {
  background: rgba(47, 224, 191, 0.06);
  border: 1px solid rgba(47, 224, 191, 0.25);
}
.callout.tip b { color: var(--teal); }

.callout.warn {
  background: rgba(251, 191, 36, 0.06);
  border: 1px solid rgba(251, 191, 36, 0.28);
}
.callout.warn b { color: var(--warn); }

.callout.err {
  background: rgba(251, 113, 133, 0.06);
  border: 1px solid rgba(251, 113, 133, 0.28);
}
.callout.err b { color: var(--err); }
```

---

### 5.8 Tables

```css
.tbl-wrap {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid var(--line-soft);
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  min-width: 460px;
}

th, td {
  padding: 10px 14px;
  text-align: left;
  border-bottom: 1px solid var(--line-soft);
}

thead th {
  background: rgba(255, 255, 255, 0.05);
  color: var(--ink-dim);
  font-size: 12.5px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

tbody tr:hover td {
  background: rgba(255, 255, 255, 0.025);
}

td code {
  font-family: var(--mono);
  color: var(--teal-soft);
  background: rgba(47, 224, 191, 0.08);
  padding: 1px 6px;
  border-radius: 5px;
}
```

---

### 5.9 Accordion (`<details>` / `<summary>`)

Leverages native HTML `<details>` and `<summary>` for zero-JS accessibility and native keyboard control.

```css
.acc > summary {
  list-style: none;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 26px;
}

.acc > summary::-webkit-details-marker {
  display: none;
}

.acc > summary:hover {
  background: rgba(255, 255, 255, 0.025);
}

.acc > summary .chev {
  margin-left: auto;
  color: var(--ink-faint);
  transition: transform 0.2s ease;
}

.acc[open] > summary .chev {
  transform: rotate(180deg);
}

.acc[open] .acc-body {
  border-top: 1px solid var(--line-soft);
  padding: 18px 26px;
}
```

---

### 5.10 Segmented Control / Tabs

```css
.cmp-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--line-soft);
  border-radius: 16px;
  padding: 7px;
  width: fit-content;
}

.cmp-tab {
  padding: 9px 16px;
  border-radius: 11px;
  font-size: 14px;
  font-weight: 700;
  color: var(--ink-dim);
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cmp-tab:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
}

.cmp-tab.active {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.18);
  background: linear-gradient(120deg, rgba(47, 224, 191, 0.16), rgba(139, 92, 246, 0.18) 55%, rgba(255, 106, 194, 0.15));
}
```

---

### 5.11 Dropdown Popovers

```css
.dl-wrap {
  position: relative;
}

.dl-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  z-index: 40;
  min-width: 220px;
  padding: 6px;
  border-radius: 14px;
  background: rgba(24, 28, 38, 0.97); /* Higher opacity prevents backdrop bleed */
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: var(--shadow);
  backdrop-filter: blur(18px);
  display: none;
}

/* Visibility is triggered on the parent wrapper */
.dl-wrap.open .dl-menu {
  display: block;
  animation: pop 0.16s ease;
}

@keyframes pop {
  from { opacity: 0; transform: translateY(-6px) scale(0.98); }
  to { opacity: 1; transform: none; }
}
```

---

### 5.12 Flow Diagrams & Decision Trees (Pure CSS)

```css
.flow {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.fn {
  width: 100%;
  max-width: 720px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 13px 18px;
  border-radius: 15px;
  border: 1px solid var(--line-soft);
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(8px);
}

.fn-tag {
  flex: none;
  font-size: 11px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 999px;
  white-space: nowrap;
}

/* Node Variants */
.fn-primary { border-color: rgba(139, 92, 246, 0.35); background: rgba(139, 92, 246, 0.06); }
.fn-success { border-color: rgba(52, 211, 153, 0.35); background: rgba(52, 211, 153, 0.06); }
.fn-accent  { border-color: rgba(255, 106, 194, 0.35); background: rgba(255, 106, 194, 0.06); }

/* Decision Branch Layout */
.flow.dec { align-items: stretch; }
.flow.dec > .fn,
.flow.dec > .f-arrow { margin-inline: auto; }

.dec .b-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 26px;
  align-items: start;
}

.b-pill {
  align-self: center;
  padding: 7px 15px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  border: 1px solid var(--line-soft);
}

.b-pill.option-a {
  border-color: rgba(251, 113, 133, 0.4);
  color: #ffd7de;
  background: rgba(251, 113, 133, 0.07);
}

.b-pill.option-b {
  border-color: rgba(47, 224, 191, 0.35);
  color: var(--teal-soft);
  background: rgba(47, 224, 191, 0.06);
}
```

---

### 5.13 Feature Comparison Matrix

```css
table.matrix {
  min-width: 660px;
  font-size: 13.8px;
}

.matrix th.m-col {
  width: 130px;
}

.matrix td.m-highlight {
  background: rgba(255, 106, 194, 0.055);
}

.m-yes {
  color: var(--teal-soft);
  font-weight: 800;
}

.m-no {
  color: var(--ink-faint);
  font-weight: 700;
}
```

---

### 5.14 Problem-to-Solution Cards

```css
.uc-card {
  padding: 21px 22px 17px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-radius: 20px;
}

.uc-k {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.uc-line.u-problem .uc-k { color: var(--err); }
.uc-line.u-solution .uc-k { color: var(--teal-soft); }

.uc-line.u-problem p { color: rgba(255, 201, 209, 0.82); }
.uc-line.u-solution p { color: #cfeae4; }

.uc-act {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px dashed var(--line-soft);
}
```

---

### 5.15 Tier / Pricing Cards

```css
.tier-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 22px;
}

.tc-standard {
  border-color: rgba(47, 224, 191, 0.3);
}

.tc-premium {
  border-color: rgba(255, 106, 194, 0.38);
  box-shadow: 0 18px 60px -14px rgba(255, 106, 194, 0.2), var(--shadow-soft);
  position: relative;
}

.tc-badge {
  position: absolute;
  top: 18px;
  right: 18px;
  padding: 5px 12px;
  border-radius: 999px;
  color: #fff;
  font-size: 11.5px;
  font-weight: 800;
  background: linear-gradient(120deg, #17b99a 0%, #7c4cf0 58%, #e455ac 100%);
}

.tc-price .price-num {
  font-size: 44px;
  font-weight: 850;
  line-height: 1;
}

.tc-list li::before {
  content: "✓";
  color: var(--teal);
  font-weight: 800;
  margin-right: 8px;
}

.tc-premium .tc-list li::before {
  color: var(--pink-soft);
}
```

---

## 6. Layout Patterns & App Shell

```css
.wrap {
  max-width: 1140px;
  margin-inline: auto;
  padding-inline: 22px;
}

main {
  min-height: 62vh;
  padding: 30px 0 70px;
}

.section {
  margin-top: 56px;
}

/* Sticky Glass Header */
.site-head {
  position: sticky;
  top: 0;
  z-index: 60;
  height: var(--head-h);
  backdrop-filter: blur(20px) saturate(1.3);
  -webkit-backdrop-filter: blur(20px) saturate(1.3);
  background: rgba(13, 16, 22, 0.72);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.headbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--ink);
  font-weight: 800;
  font-size: 1.15rem;
}

.main-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link {
  color: var(--ink-dim);
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 999px;
  transition: color 0.15s ease, background 0.15s ease;
}

.nav-link:hover,
.nav-link.active {
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
}

@media (max-width: 820px) {
  .main-nav {
    position: fixed;
    inset: var(--head-h) 12px auto 12px;
    z-index: 55;
    flex-direction: column;
    align-items: stretch;
    padding: 14px;
    border-radius: 18px;
    background: rgba(18, 21, 29, 0.97);
    border: 1px solid var(--line);
    box-shadow: var(--shadow);
    backdrop-filter: blur(24px);
    display: none;
    max-height: calc(100vh - var(--head-h) - 20px);
    overflow-y: auto;
  }

  .main-nav.open {
    display: flex;
  }
}
```

---

## 7. Motion System & Micro-Interactions

| Animation Name | Parameters | Applied Surface |
|---|---|---|
| `fadeUp` | `translateY(14px) → 0`, 0.5s `cubic-bezier(.22,1,.36,1)` | Newly mounted views, route transitions |
| **Stagger** | Sequential delay increment of 0.05s (up to 8 items) | Card grids and search results entering view |
| `pulse` | opacity `1 → 0.35 → 1`, 2.2s ease | Real-time status indicator dots |
| `reveal` | `fadeUp` 0.5s on `.revealed`, stagger `0.05s` per item (cap 8) via `--reveal-delay` | Scroll-in reveals: timeline items, card grids, glossary results, callouts |
| `lift-compact` | `translateY(-2px)` + border `rgba(255,255,255,.22)` + `--shadow`, `0.2s / 0.25s ease` | Compact tile hovers: timeline cards, glossary cards, roadmap columns (major `.card` keeps `-5px`) |
| `drift` | translate + scale, 26s–38s alternate | Background ambient gradient orbs |
| `pop` | 0.16s, `translateY(-6px) scale(0.98)` | Popover and dropdown openings |
| **Hover Lift** | `translateY(-2px..-5px)` + specular border + shadow | Interactive cards and button surfaces |
| **Progress Easing** | 0.6s–0.9s `cubic-bezier(.22,1,.36,1)` | Circular SVG gauges and linear progress fills |

**Standard System Easing Curve**:
`cubic-bezier(0.22, 1, 0.36, 1)` (fluid ease-out curve with subtle deceleration overshoot).

### Consent-Gated Scroll Reveal (SDLC Journey pattern)

Never pre-hide content unless the runtime can prove it can reveal it. The reference implementation gates every hidden state behind an `html.reveal-ready` class that is added only when **both** hold:

1. `IntersectionObserver` is available, **and**
2. `prefers-reduced-motion: reduce` is **not** set.

```css
.reveal-ready .reveal:not(.revealed) { opacity: 0; }
.reveal-ready .reveal.revealed {
  animation: fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--reveal-delay, 0s);
}

/* Compact-tile hover lift (major .card stays at -5px) */
.tl-card, .glos-card, .road-col { transition: transform 0.2s ease, box-shadow 0.25s ease, border-color 0.25s ease; }
.tl-item:hover .tl-card,
.glos-card:hover,
.road-col:hover { transform: translateY(-2px); border-color: rgba(255, 255, 255, 0.22); box-shadow: var(--shadow); }
```

```javascript
var revealOK = 'IntersectionObserver' in window &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (revealOK) document.documentElement.classList.add('reveal-ready');

function initReveal(root) {
  if (!revealOK) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var i = Number(el.getAttribute('data-reveal-i') || 0);
      el.style.setProperty('--reveal-delay', (Math.min(i, 7) * 0.05).toFixed(2) + 's');
      el.classList.add('revealed');
      io.unobserve(el); /* one-shot — no lingering observation cost */
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  root.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
}
```

**Rules**:
- Markup contract: candidates carry `class="reveal"` plus `data-reveal-i="<stagger index>"`.
- Dynamic re-renders (e.g. live search filtering) must call `initReveal(grid)` after every paint so new nodes re-arm.
- Fallback equals full visibility: no JS, legacy browsers, or reduced motion → no `.reveal-ready` → nothing is ever hidden. The mandatory override below still clamps any residual transition to `0.001s` (belt and suspenders).

### Mandatory Accessibility Motion Override

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001s !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001s !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 8. Responsive Strategy & Breakpoints

| Breakpoint Range | Architectural Changes |
|---|---|
| **> 1020px** | Full multi-column layout, 3-column card grids, horizontal desktop navigation |
| **821px – 1020px** | 2-column grid reflow, compact header navigation (padding and gap tightening) |
| **≤ 820px** | Navigation switches to mobile hamburger drawer, horizontal lists reflow to stacked rows |
| **≤ 560px** | Single column layout, container horizontal padding narrows to 16px, CTA buttons stretch full width |

**Navigation Squeeze Mitigation**:
When desktop navigation contains 5+ items, horizontal real-estate compresses between 821px and 1000px before the mobile drawer engages. Apply intermediate media queries to prevent wrap collisions:

```css
@media (max-width: 960px) and (min-width: 821px) {
  .main-nav { gap: 3px; }
  .nav-link { padding: 6px 9px; font-size: 13px; }
}
```

---

## 9. Accessibility (a11y) Checklist

- [x] **Focus Indicators**: Explicit `:focus-visible { outline: 2px solid var(--violet-soft); outline-offset: 2px; }` applied across all interactive targets.
- [x] **Screen Reader Labels**: `.sr-only` utility applied to icon-only triggers (e.g. mobile navigation toggle).
- [x] **ARIA States**: Dynamic `aria-expanded="true|false"` bindings on dropdowns and mobile toggles.
- [x] **Keyboard-Friendly Accordions**: `<details>` / `<summary>` implementation for full out-of-the-box keyboard operability.
- [x] **Color Contrast Compliance**:
  - Primary text (`--ink`): ~15:1
  - Secondary text (`--ink-dim`): ~8:1
  - Metadata / captions (`--ink-faint`): ~4.6:1 (WCAG AA compliant for small typography)
- [x] **Decorative Separation**: Ambient orbs and grids marked with `aria-hidden="true"`.
- [x] **Custom Selection**: Selection highlight styled with high contrast (`::selection { background: rgba(139, 92, 246, 0.45); color: #fff; }`).
- [x] **Themed Scrollbars**: Discreet scrollbar palette matches canvas background (`#0c0f15` track, `#262d3b` thumb).

---

## 10. Architectural UX & Interaction Patterns

### 10.1 Lightweight Hash Router
Simple single-page application routing using native `window.location.hash`:

```javascript
// Lightweight router: parses #/path or #/resource/:id
window.addEventListener('hashchange', handleRoute);
window.addEventListener('DOMContentLoaded', handleRoute);

function handleRoute() {
  const hash = window.location.hash.slice(1) || '/';
  const appContainer = document.getElementById('app');

  // Render view HTML and update document title
  const view = resolveRoute(hash);
  appContainer.innerHTML = view.template;
  document.title = `${view.title} | Application`;

  // Update active state on navigation elements
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${hash}`);
  });
}
```

### 10.2 State Persistence via `localStorage`
Safely manage client persistence with validation and exception handling:

```javascript
const STORAGE_KEY = 'app_state:v1';

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Unable to persist application state:', err);
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn('Unable to retrieve application state:', err);
    return null;
  }
}
```

### 10.3 Asynchronous Clipboard Utility
Clipboard copying with transparent fallback for non-secure contexts:

```javascript
async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // Fall through to fallback method
    }
  }

  // Fallback using temporary textarea
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  textArea.style.left = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  let success = false;
  try {
    success = document.execCommand('copy');
  } catch (err) {
    success = false;
  }
  textArea.remove();
  return success;
}
```

### 10.4 Safe Mini-Markdown Formatter
Parses inline bold (`**text**`) and inline code (`` `code` ``) while preventing XSS through upfront HTML escaping:

```javascript
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatInlineMarkdown(rawText) {
  const safe = escapeHTML(rawText);
  const codeSnippets = [];

  // 1. Extract inline code into tokenized placeholders
  const withPlaceholders = safe.replace(/`([^`]+)`/g, (match, code) => {
    codeSnippets.push(`<code>${code}</code>`);
    return ` ${codeSnippets.length - 1} `;
  });

  // 2. Parse bold markup
  const boldParsed = withPlaceholders.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // 3. Restore preserved code snippets
  return boldParsed.replace(/ (\d+) /g, (match, index) => codeSnippets[Number(index)] || match);
}
```

### 10.5 Cache-Busting Asset Versioning
Append automated revision parameters to prevent stale browser caching in local development servers:

```html
<link rel="stylesheet" href="css/style.css?v=1.0.1">
<script defer src="js/app.js?v=1.0.1"></script>
```

---

## 11. Engineering Pitfalls & Debugging Checklist

1. **Dual Event Handlers (Double Toggle Inversion)**
   Binding events both directly to a button and through event delegation on `document` triggers two sequential invocations on a single click, immediately cancelling the toggle state.
   *Resolution*: Establish a single event delegation pipeline when rendering dynamic DOM nodes.

2. **CSS / JS Selector Target Mismatch**
   A common bug arises when JS toggles an active class on a container (e.g. `.menu-wrap.open`), while CSS expects the modifier on the child element (e.g. `.menu-dropdown.open`).
   *Resolution*: Always verify visibility using `window.getComputedStyle(element).display` rather than inspecting DOM classes alone.

3. **Flex Centering in `align-items: stretch` Containers**
   When parent flex containers default to `align-items: stretch`, fixed-width elements (e.g., flow arrows or connectors) collapse to the left edge unless explicitly centered with `margin-inline: auto`.

4. **Raw Unescaped Markdown Output**
   Rendering user input with `escapeHTML()` alone will display raw markdown asterisks (`**bold**`). Always verify parser output for unparsed delimiter tokens.

5. **Sticky Header Covering Anchor Scroll Targets**
   When navigating to internal hash links (`#section-id`), the sticky header will visually occlude the first `66px` of content unless offset via CSS `scroll-margin-top: calc(var(--head-h) + 16px);`.

6. **Breakpoint Squeeze Gaps**
   A navigation bar with multiple items may wrap onto a second line between `821px` and `960px` before the hamburger breakpoint (`820px`) takes effect. Always calculate actual layout width and adjust link paddings dynamically.

7. **Local Development 304 Cache Pitfalls**
   Local development servers with 1-second file mtime granularity can serve cached `304 Not Modified` headers if changes are saved within the same second. Use explicit query string versions (`?v=N`) during testing.

8. **Variable Scoping in Async Loop Closures**
   Calculations accumulating state across asynchronous promises or nested callbacks can throw `ReferenceError` at runtime without triggering compile-time lint warnings. Run end-to-end execution smoke tests.

---

## 12. Quick-Start Starter Kit

A self-contained boilerplate providing the complete dark glassmorphic look and feel:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Modern Application</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <!-- Layered Background System -->
  <div class="bg" aria-hidden="true">
    <span class="orb orb-a"></span>
    <span class="orb orb-b"></span>
    <span class="bg-grid"></span>
  </div>

  <!-- Sticky Glass Navigation Header -->
  <header class="site-head">
    <div class="wrap headbar">
      <a class="brand" href="#"><span>App<em>Core</em></span></a>
      <nav class="main-nav">
        <a href="#/" class="nav-link active">Home</a>
        <a href="#/features" class="nav-link">Features</a>
        <a href="#/docs" class="nav-link">Documentation</a>
        <a href="#/get-started" class="nav-link btn btn-primary btn-sm">Get Started</a>
      </nav>
    </div>
  </header>

  <!-- Main Content Canvas -->
  <main class="wrap">
    <section class="hero">
      <div>
        <span class="hero-kicker"><span class="dot"></span> System Operational</span>
        <h1>Engineered for <span class="grad-text">Pure Performance</span></h1>
        <p class="lead" style="color: var(--ink-dim); margin-top: 12px; font-size: 1.15rem;">
          A lightweight, zero-dependency design system for modern web interfaces.
        </p>
        <div style="display: flex; gap: 12px; margin-top: 24px;">
          <a class="btn btn-primary" href="#">Explore Platform</a>
          <a class="btn btn-ghost" href="#">View Source</a>
        </div>
      </div>
    </section>

    <section class="section" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
      <div class="glass card" style="padding: 24px;">
        <h3 style="margin: 0 0 10px 0;">Ultra Lightweight</h3>
        <p style="color: var(--ink-dim); margin: 0; font-size: 14.5px;">No heavy frameworks or build tool dependencies required.</p>
      </div>
      <div class="glass card" style="padding: 24px;">
        <h3 style="margin: 0 0 10px 0;">Cohesive Palette</h3>
        <p style="color: var(--ink-dim); margin: 0; font-size: 14.5px;">Unified triad accents with calibrated contrast ratios.</p>
      </div>
      <div class="glass card" style="padding: 24px;">
        <h3 style="margin: 0 0 10px 0;">Universal Accessibility</h3>
        <p style="color: var(--ink-dim); margin: 0; font-size: 14.5px;">High-contrast text, clear focus rings, and reduced-motion safeguards.</p>
      </div>
    </section>
  </main>
</body>
</html>
```

---

## 13. Component Catalog & Architecture Guidelines

When extending this design system for new domain requirements, adhere to these core rules:

- **The 3-Alpha Palette Rule**: When defining a new status or category color, generate the entire component state using a single base color across three alpha tiers (`0.08` background, `0.40` border, `1.0` text).
- **Pill Shape Affordance**: Interactive indicators, filter tags, and primary action triggers should maintain pill geometry (`border-radius: 999px`) to visually separate controls from rectangular card surfaces (`--r-lg: 22px`).
- **Triad Gradient Restraint**: Reserve full vibrant gradients (`--grad`) exclusively for quantitative indicators, progress rings, and primary action triggers. Use subtle pastel gradients (`--grad-soft`) for typographic highlights.
- **Progressive Enhancement**: Default to semantic HTML5 elements (`<details>`, `<summary>`, `<nav>`, `<table>`) before introducing JavaScript interaction controllers.
- **Separation of Presentation & Data**: Keep structured content in standardized JavaScript objects or JSON schemas, using minimal string renderers to output markup into the DOM.

---

## 14. Implementation Audit — SDLC Journey (v1.0.8)

> Post-build audit of the reference implementation against this specification. Findings were verified in-browser via computed-style assertions and a console-clean route walk across every view. Future UI changes must re-run this checklist and append new findings below.

### 14.1 Audit Scope

| Surface | Checks performed |
|---|---|
| Home | Hero grid, stat cards, compact progress ring, era timeline (desktop 3-col + ≤860px stacked rows), module grid |
| Module reader ×9 | Reader head, sticky TOC, prose text tiers, callouts, quotes, code blocks, tables/matrix, SVG diagrams (7), quick-check quizzes, challenge gate |
| Glossary | 64-term grid, live filter, empty state, input focus/placeholder contrast |
| Exam | Header ring (120px), 12-question flow, progress bar, result panel |
| System | Toast stack, modal (+ `watch`/`danger`), 404 route, header/nav breakpoints, `:focus-visible`, reduced-motion |

### 14.2 Findings & Resolutions

| # | Severity | Finding | Resolution |
|---|---|---|---|
| 1 | High | In-page anchor `href="#challenge"` was intercepted by the hash router → dead end (404) and reader state loss | Replaced with a real `type="button"` using `scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })`; sticky-header occlusion already covered by `[id] { scroll-margin-top }` |
| 2 | Medium | Compact progress ring had no size rule → free-scaled to 127px with a blurry oversized label | `.ring-wrap svg { width: 64px; height: 64px }` (`.ring-lg` remains 120px per §5.5) |
| 3 | Low | Off-scale inline radius `17px` on the exam icon tile | Normalized to `--r-md` (16px) — the radius scale is 22/16/11 only |
| 4 | Medium | Timeline built on inline `<span>`s → `margin:auto`/centering collapsed, text clipped; single absolute track line broke across wrapped rows (7 items > 5 columns) | Rebuilt as flex-column cards with per-card top accent line, pill year chip, `repeat(auto-fill, minmax(196px, 1fr))` grid, equal-height rows via `margin-top: auto`, mobile row layout preserved |

### 14.3 Verified Compliant (no changes required)

All design tokens (colors, glass fills, borders, radii, shadows, `--head-h`, font/mono stacks — plus a deliberate Thai font-stack extension), glass card recipe, button geometry + CTA bevel shadow, `.k-chip` / `.hero-kicker` / icon-tile, code-block syntax palette, semantic callouts, tables + matrix classes, toasts, modal variants, motion durations/curves, all four breakpoints, `:focus-visible` outline, `.sr-only`, ARIA states, `::selection`, themed scrollbars, `scroll-margin-top` anchor offset.

### 14.4 Motion Polish Applied (this revision)

- Scroll-reveal rollout: timeline (7 items), module cards (9), glossary cards (64, re-armed on every filter keystroke), reader callouts — all following the Consent-Gated Scroll Reveal pattern in §7.
- Compact-tile `-2px` hover lift on timeline, glossary, and roadmap surfaces.
- Reduced-motion double gate verified live: with `prefers-reduced-motion: reduce` active, `reveal-ready` is withheld (content 100% visible on load) and residual hover transitions measure `0.001s`.
- Stagger delays verified at `0.05s` increments up to the 8-item cap (`0.00s–0.35s`).

### 14.5 Regression Checklist (re-run after any UI edit)

1. `node --check` every JS file; walk all 11 routes with the console open — zero errors.
2. Assert `document.documentElement.scrollWidth <= innerWidth` on every route (no horizontal overflow).
3. Confirm no element with `.reveal` is invisible when `reveal-ready` is absent.
4. Confirm every in-page jump is a button/`scrollIntoView`, never a bare `#anchor` href (router conflict, §11.5).
5. Grep for `alert(`/`confirm(`/`prompt(` — must always be zero.
6. Bump `?v=` asset versions in `index.html` after CSS/JS edits.
