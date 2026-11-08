# Changelog — Zelvior DevKit

All notable changes to **Zelvior DevKit** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.0.0] - 2026-11-08

### Added
- **IndexedDB-First Persistence Architecture**: Replaced all `localStorage` and `sessionStorage` with a centralized, versioned IndexedDB database (`zelvior_devkit_db` v2) across six distinct stores (`settings`, `favorites`, `recentTools`, `snippets`, `customPresets`, `searchHistory`).
- **Complete Open-Source Markdown Suite**: Added `README.md`, `LICENSE.md` (MIT), `SECURITY.md`, `PRIVACY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `CHANGELOG.md`.
- **In-App Legal & Compliance Center**: Built interactive tabbed legal modal with deep-linking support (`#/legal/privacy`, `#/legal/terms`, `#/legal/security`, `#/legal/license`, `#/legal/storage`).
- **Custom Local Snippet Manager**: Created `<SnippetsModal />` supporting code snippet creation, multi-tag categorization, live search, and clipboard copying.
- **Data & Backup Manager**: Added `<DataManagerModal />` providing live store inspection, JSON backup export, verified JSON restoration, and store-specific clearing.
- **Dedicated Vector Brand Assets**: Created scalable SVG assets in `/public/brand/` (`symbol.svg`, `primary-logo.svg`, `compact-icon.svg`, `favicon.svg`, `wordmark.svg`) and the `<BrandLogo />` component.
- **Progressive Web App (PWA)**: Added `manifest.json`, offline application shell caching via `sw.js`, and an in-app `<PWAInstallButton />` with iOS Safari instructions.
- **3-Mode Theme System**: Integrated `system` auto-detection with `dark` and `light` manual overrides and zero-flicker pre-render hydration.

### Fixed
- Fixed IndexedDB `NotFoundError: One of the specified object stores was not found` by implementing automatic version migration and self-healing store checks in `withTransaction`.
- Resolved mobile viewport overflow and navigation drawer alignment on narrow viewports.

---

## [2.0.0] - 2026-11-07

### Added
- **Sitemap.xml Generator**: Added standardized visual XML sitemap builder in the Web Development category supporting `changefreq`, `priority`, `lastmod`, and XML export.
- **Vercel Production Deployment Configuration**: Added `vercel.json` with single-page application routing, strict security headers, and asset caching policies.
- **Bento Grid Discovery**: Redesigned home dashboard featuring a responsive bento grid showcasing popular tools, recent utilities, and category navigation.

### Improved
- Polished monochrome typography hierarchy and spacing.
- Enhanced tool input/output layouts with instant byte count and line metrics.

---

## [1.0.0] - 2026-11-06

### Initial Release
- **40 Browser Utilities** spanning 8 developer categories:
  - JSON & Data (Formatter, Minifier, Validator, XML/CSV/YAML converters).
  - Text & Code Diff (Unified diff, Side-by-side, Case converter, Slug generator).
  - Encoding & Decoding (Base64, URL, HTML, Hex, Unicode, JWT Debugger).
  - Security & Cryptography (Hash Generator, HMAC, Password Generator, UUID v4, Keypair generator).
  - Web Development (URL Parser, Meta Tag Generator, HTTP Status lookup, User-Agent parser).
  - CSS & Design (CSS Minifier, Box Shadow Generator, Color Converter, Flexbox visualizer).
  - Time & Date (Timestamp Converter, Cron Parser, Timezone comparison).
  - Developer Utilities (Chmod Calculator, Markdown Previewer, Regex Tester, SQL Formatter).
- Fast global search palette triggered by `⌘K` or `Ctrl+K`.
- Strict client-side execution with zero remote transmission.
