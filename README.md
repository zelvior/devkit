<div align="center">
  <img src="./public/brand/primary-logo.svg" alt="Zelvior DevKit Logo" width="320" />
  <p><a href="https://zdevkit.vercel.app"><strong>Visit Zelvior DevKit →</strong></a></p>
  <p><strong>Everything developers need. Nothing they don't.</strong></p>
  <p>41 fast, privacy-first developer utilities running 100% locally in your browser.</p>

  <p>
    <a href="https://github.com/zelvior/devkit/blob/main/LICENSE.md"><img src="https://img.shields.io/badge/license-MIT-black.svg?style=flat-square" alt="License: MIT" /></a>
    <a href="https://github.com/zelvior/devkit"><img src="https://img.shields.io/badge/utilities-41%20Tools-black.svg?style=flat-square" alt="41 Utilities" /></a>
    <a href="https://github.com/zelvior/devkit/blob/main/PRIVACY.md"><img src="https://img.shields.io/badge/privacy-100%25%20Client--Side-black.svg?style=flat-square" alt="100% Client-Side" /></a>
    <a href="https://github.com/zelvior/devkit"><img src="https://img.shields.io/badge/pwa-installable-black.svg?style=flat-square" alt="PWA Installable" /></a>
    <a href="https://github.com/zelvior/devkit/blob/main/SECURITY.md"><img src="https://img.shields.io/badge/security-IndexedDB%20Only-black.svg?style=flat-square" alt="IndexedDB Only" /></a>
  </p>
</div>

---

## Overview

**Zelvior DevKit** is a modern, privacy-first developer utilities platform engineered by **Zelvior Labs**.

Most online developer tools silently send your code snippets, JSON payloads, API secrets, and JWT tokens to remote servers for logging, telemetry, or model training. **Zelvior DevKit processes 100% of your data inside your local browser runtime.**

---

## Key Features

- **41 Professional Developer Utilities**:
  - **JSON & Data**: Formatter, Minifier, Validator, CSV ↔ JSON, XML ↔ JSON, YAML ↔ JSON.
  - **Text & Diff**: Unified & Side-by-Side Code Diff, Case Converter, String Inspector, URL Slugify.
  - **Encoding & Decoding**: Base64, URL Encoder, HTML Entities, Hex Converter, Unicode Inspector, JWT Token Debugger.
  - **Security & Crypto**: SHA-256/512/MD5 Hasher, HMAC Generator, Cryptographic Password Generator, UUID v4 Generator, RSA Keypair Generator.
  - **Web Development**: Sitemap.xml Visual Builder, URL Parser & Query Inspector, OpenGraph Meta Tag Generator, HTTP Status Code Directory, User-Agent Inspector.
  - **CSS & Visual Design**: CSS Formatter & Minifier, Box Shadow Generator, Color Converter (HEX/RGB/HSL), Flexbox Layout Visualizer.
  - **Time & Scheduling**: Unix Epoch Timestamp Converter, Cron Schedule Expression Parser, Timezone Offset Calculator.
  - **Developer Tools**: UNIX Chmod Permissions Calculator, Real-time Markdown Previewer, Regular Expression Tester with capture groups, SQL Query Formatter.
- **IndexedDB-Only Persistence**: Zero `localStorage` or `sessionStorage`. All bookmarks, recent tools, and snippets reside in a structured, versioned IndexedDB database (`zelvior_devkit_db`).
- **Memory-Only Isolation for Secrets**: Passwords, HMAC secrets, private keys, and JWT signatures are never saved to disk and are excluded from backups.
- **Progressive Web App (PWA)**: Works offline without internet connectivity. Installable on macOS, Windows, Linux, Android, and iOS.
- **Fast Keyboard Discovery (⌘K / Ctrl+K)**: Unified fuzzy command palette for instantaneous utility switching.
- **Local Snippets & Data Manager**: Save code snippets with tags and export/import portable `.json` configuration backups.
- **3-Mode Monochrome Design**: Ultra-refined black and white theme supporting System Auto-detect, Dark Mode, and Light Mode with zero visual flicker.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 Browser Client (Localhost / PWA)            │
└──────┬───────────────────────┬───────────────────────────────┘
       │                       │
       ▼                       ▼
┌──────────────────┐   ┌──────────────────────────────────────┐
│ Web Crypto API   │   │      IndexedDB Storage Layer         │
│ (W3C Standards)  │   │        (zelvior_devkit_db)           │
├──────────────────┤   ├──────────────────────────────────────┤
│ • SHA-256 / HMAC │   │ • settings (Theme, UI state)         │
│ • RSA Key Pairs  │   │ • favorites (Pinned tools)           │
│ • CSPRNG UUID v4 │   │ • recentTools (Access history)       │
│ • Secure Passwds │   │ • snippets (Custom user snippets)    │
└──────────────────┘   │ • customPresets & searchHistory      │
                       └──────────────────────────────────────┘
                                  │
                                  ▼
                       ┌──────────────────────┐
                       │  Network Isolation   │
                       ├──────────────────────┤
                       │  ZERO Cloud Logging  │
                       │  ZERO Telemetry      │
                       │  ZERO Code Uploads   │
                       └──────────────────────┘
```

---

## Quick Start

### Running Locally

```bash
# Clone the repository
git clone https://github.com/zelvior/devkit.git
cd devkit

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Building for Production

```bash
# Build production bundle
npm run build

# Preview build locally
npm run preview
```

### Deploying to Vercel

Zelvior DevKit is pre-configured with `vercel.json` for seamless deployment:

```bash
npx vercel
```

---

## Documentation & Legal Policies

- [LICENSE.md](./LICENSE.md) — Permissive MIT License
- [PRIVACY.md](./PRIVACY.md) — Privacy Architecture & Zero-Data Guarantee
- [SECURITY.md](./SECURITY.md) — Security Model & Vulnerability Disclosure
- [CONTRIBUTING.md](./CONTRIBUTING.md) — Contribution Guide & Developer Guidelines
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) — Community Code of Conduct
- [CHANGELOG.md](./CHANGELOG.md) — Release History & Version Updates

---

## Community & Support

- **Author**: Zelvior Labs
- **Website**: [https://zdevkit.vercel.app](https://zdevkit.vercel.app)
- **Repository**: [https://github.com/zelvior/devkit](https://github.com/zelvior/devkit)
- **License**: MIT
