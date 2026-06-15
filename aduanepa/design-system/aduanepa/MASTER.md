# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.
>
> **SOURCE OF TRUTH:** This file is reconciled with `guides/claude.md` (UI & Design
> Directives + Color Scheme) and the implemented tokens in `app/globals.css`. Those
> three must always agree. The green-on-white identity is authoritative.

---

**Project:** AduanePa — AI-powered nutrition & meal planning PWA for Ghanaian users
**Category:** Health / Nutrition / Wellness
**Updated:** 2026-06-15

---

## Global Rules

### Color Palette (forest green on white)

| Role | Hex | Token / Tailwind |
|------|-----|------------------|
| Primary | `#1A5C38` | `--color-primary` / `bg-primary` |
| Primary hover | `#154d2f` | `--color-primary-hover` / `hover:bg-primary-hover` |
| Primary light | `#2D8653` | `--color-primary-light` |
| Surface (page) | `#F4FAF6` light · `#0D2B1A` dark | `bg-bg-main` |
| Surface (card) | `#FFFFFF` light · `#122b1e` dark | `bg-bg-card` |
| Text primary | `#1c1c1c` light · `#f4faf6` dark | `text-text-primary` |
| Text secondary | `#555555` light · `#a5d6a7` dark | `text-text-secondary` |
| Text muted | `#9e9e9e` light · `#4CAF50` dark | `text-text-muted` |
| Success | `#22c55e` | `text-success` |
| Warning | `#F59E0B` | `text-warning` |
| Error | `#f04438` | `text-error` |

**Color Notes:** Forest green is natural, trustworthy, grounded in Ghanaian visual
culture. Dark mode stays on-brand with deep forest green (`#0D2B1A`) rather than
generic charcoal. Health readings use semantic green/amber/red.

### Typography

- **Display / Heading Font:** Space Grotesk (`font-display`)
- **Body Font:** Inter (`font-sans`)
- **Mood:** clean, clinical, trustworthy, modern, accessible
- Page title: `text-2xl font-bold` · Section heading: `text-lg font-semibold`
  · Body: `text-sm` · Label/caption: `text-xs text-text-muted`

### Spacing & Radius

| Token | Usage |
|-------|-------|
| `rounded-2xl` | Cards, modals, sidebars |
| `rounded-lg` | Inputs, buttons |
| Section gaps | Generous (≥ `gap-6` within pages, `py-16`+ for landing sections) |

### Shadow Depths

| Level | Usage |
|-------|-------|
| `shadow-sm` | Cards in light mode (subtle lift) |
| `border border-border-light` (no shadow) | Cards in dark mode |
| `shadow-lg` | Modals, dropdowns, hover lift on feature cards |

---

## Style Guidelines

**Style:** Soft UI Evolution — improved shadows (softer than flat, clearer than
neumorphism), subtle depth, accessibility-focused, modern 200ms transitions, WCAG AA.

**Best For:** Health/wellness, modern SaaS, professional business tools.

### Landing Page Pattern

**Pattern Name:** Storytelling + Social Proof (app-quality feel)

- **CTA Placement:** Above the fold (primary "Create account" + secondary "Sign in")
- **Section Order:** Hero → Features → How it works → Built-for-Ghana proof → Final CTA → Footer
- **Feel:** Large sections (≥48px gaps), bold but calm, device/app-quality polish,
  green duotone accents, no text walls.

---

## Component Conventions

- **Cards:** `bg-bg-card rounded-2xl shadow-sm` (light) / `border border-border-light` (dark),
  padding `p-5`–`p-6`, hover `hover:shadow-lg transition-all duration-200`.
- **Primary button:** `bg-primary text-white font-semibold hover:bg-primary-hover`.
- **Secondary button:** shadcn `variant="outline"`.
- **Sidebar active state:** green left border + green text + subtle green-tinted background
  (`bg-primary/10 text-primary border-l-2 border-primary`).
- **Icons:** Lucide React only, fixed sizing (`h-5 w-5` nav, `h-4 w-4` inline). Never emojis.
- **Toasts:** Sonner only. Never `alert()` / `confirm()`.

---

## Anti-Patterns (Do NOT Use)

- ❌ **Emojis as icons** — use Lucide SVG icons.
- ❌ **Hardcoded hex colors** — always use CSS-variable-backed Tailwind tokens so dark mode works.
- ❌ **Missing `cursor-pointer`** on clickable elements.
- ❌ **Layout-shifting hovers** (scale transforms that reflow) — animate color/shadow instead.
- ❌ **Low-contrast text** — maintain 4.5:1 minimum.
- ❌ **Instant state changes** — always transition 150–300ms.
- ❌ **Invisible focus states** — keep the `:focus-visible` ring.
- ❌ **Generic charcoal dark mode** — stay on deep forest green.

---

## Pre-Delivery Checklist

- [ ] No emojis used as icons (Lucide SVG only)
- [ ] All colors via tokens (`bg-primary`, `text-text-secondary`) — no raw hex
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (200ms)
- [ ] Light mode text contrast ≥ 4.5:1
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected (handled globally in globals.css)
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] Dark mode verified for every component
- [ ] No content hidden behind fixed sidebar/navbar
