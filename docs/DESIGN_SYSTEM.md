# APEX Design System & UI Guidelines

To win the hackathon, APEX must look like a Series B enterprise startup product, not a weekend project. We are optimizing for a "SpaceX Control Room" aesthetic: dark, high-contrast, glowing, and data-dense but clean.

## 1. Color Palette (Tailwind Configuration)
* **Background (Obsidian):** `#0B0F17` (Deep, slightly blue-tinted black for depth).
* **Surface/Cards (Glass Steel):** `#151D2A` (For panels and modal backgrounds. Apply `backdrop-blur-md` and `bg-opacity-80` for glassmorphism).
* **Primary Accent (Electric Cobalt):** `#3B82F6` (For primary buttons, active states, and neutral graph lines).
* **Success/Health (Neon Green):** `#10B981` (For 'System Nominal', completed checklist items).
* **Warning (Amber):** `#F59E0B` (For predictive alerts, degraded states).
* **Critical (Neon Red):** `#EF4444` (For active anomalies, blast radius highlights. Add `shadow-[0_0_15px_rgba(239,68,68,0.5)]` for a glowing effect).
* **Text Primary:** `#F3F4F6` (Off-white for readability).
* **Text Secondary:** `#9CA3AF` (Muted gray for timestamps, citations).

## 2. Typography
* **Primary Font:** `Inter` (For all UI text, buttons, and dense data tables).
* **Display/Header Font:** `Outfit` (For large numbers, dashboard titles, and the APEX logo).
* **Monospace:** `JetBrains Mono` (For sensor readings, ID tags like `V-302`, and JSON payloads).

## 3. Component Guidelines

### 3.1 The Action Card (Runbook Step)
* Must have a subtle border (`border-slate-800`) that lights up (`border-blue-500`) on hover.
* Checkboxes should be custom SVG animations (a satisfying checkmark draw animation).
* Citations (e.g., "OEM Manual pg 42") should be small, muted, and feature an external link icon.

### 3.2 The Causal Graph (React Flow)
* Nodes should NOT be basic circles. They should be rectangular 'Data Cards' showing the Asset ID, a mini-sparkline of its current sensor reading, and a status dot.
* Edges (Lines) should be animated. When a failure propagates, the edge should turn Red and use an SVG `stroke-dasharray` animation to show the "flow" of the anomaly.

## 4. Animations (Framer Motion)
* **Page Loads:** Subtle fade-in and slide-up (`y: 20`, `opacity: 0` -> `y: 0`, `opacity: 1`).
* **Alert Triggers:** When an anomaly hits, the screen border should pulse red once, and the alert modal should pop in with a slight spring physics effect.
