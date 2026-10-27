# Mohafiz Case Desk — Brand Design Tokens

This document outlines the centralized design token system implemented in `frontend/src/styles/tokens.css`.

---

## 1. Brand Palette Specification

The visual identity of **Mohafiz Case Desk** is grounded in three core colors:

| Color Name | Hex Code | Role in Application |
| :--- | :--- | :--- |
| **Charcoal** | `#323943` | Primary text (light mode), surface/backgrounds (dark mode), authoritative base. |
| **Warm Beige** | `#DED4CB` | Warm background tint (light mode), borders, primary text highlights (dark mode). |
| **Crimson Red** | `#CD2536` | Primary brand actions, important callouts, critical alerts, brand logo badge. |

---

## 2. Token Mappings

### Light Mode (`[data-theme="light"]`)

- **Page Background (`--color-bg-page`)**: `#F9F7F4` (warm off-white derived from `#DED4CB`)
- **Card Surface (`--color-bg-surface`)**: `#FFFFFF` (crisp white card surface)
- **Subtle Surface (`--color-bg-subtle`)**: `#F3EFEA` (warm neutral container)
- **Primary Text (`--color-text-primary`)**: `#323943` (brand charcoal, WCAG AAA contrast ratio > 10:1)
- **Secondary Text (`--color-text-secondary`)**: `#5C6573` (accessible contrast > 4.5:1)
- **Brand Action (`--color-brand-action`)**: `#CD2536` with `#FFFFFF` text
- **Borders (`--color-border-subtle`, `--color-border-medium`)**: `#ECE5DD`, `#DED4CB`

### Dark Mode (`[data-theme="dark"]`)

- **Page Background (`--color-bg-page`)**: `#1A1F26` (deep charcoal based on `#323943`)
- **Card Surface (`--color-bg-surface`)**: `#252B35` (elevated charcoal container)
- **Subtle Surface (`--color-bg-subtle`)**: `#202630`
- **Primary Text (`--color-text-primary`)**: `#F4EFEA` (warm off-white derived from `#DED4CB`)
- **Secondary Text (`--color-text-secondary`)**: `#C2BBB2` (muted warm neutral, WCAG AA compliant)
- **Brand Action (`--color-brand-action`)**: `#CD2536` with hover brightening to `#DE3849`
- **Borders (`--color-border-subtle`, `--color-border-medium`)**: `#333B47`, `#424D5C`

---

## 3. Theme Toggle & Anti-Flash Mechanism

1. **Inline Initialization**: An inline `<script>` in `index.html` runs synchronously before DOM rendering to set `document.documentElement.setAttribute('data-theme', ...)` according to localStorage or `prefers-color-scheme`.
2. **Persistence**: The active mode is saved to `localStorage.getItem('mohafiz_theme')`.
3. **Reactive Presenter**: `useThemePresenter` updates both React state and the `data-theme` attribute simultaneously without flickering.
