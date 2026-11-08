# Privacy Policy & Architecture Disclosure — Zelvior DevKit

**Effective Date:** January 1, 2026  
**Publisher:** Zelvior Labs  
**Product:** Zelvior DevKit  
**License:** MIT  

---

## 1. Privacy Philosophy

Zelvior DevKit is engineered around a simple premise: **Everything developers need. Nothing they don't.**

Most developer utilities on the web silently send your tokens, SQL queries, regex patterns, and API payloads to backend servers for logging, telemetry, or artificial intelligence training. 

**Zelvior DevKit does none of this.**

Every computation occurs entirely inside your local browser instance. Your sensitive data never leaves your device.

---

## 2. What Data We Collect

**We collect zero personal data, zero code inputs, and zero usage telemetry.**

Specifically:
- **No Analytics**: We do not use Google Analytics, Mixpanel, Segment, Hotjar, or any user tracking SDKs.
- **No Cookies**: We do not set tracking, marketing, or advertising cookies.
- **No Account Registration**: You are never asked to sign up, log in, or provide an email address to unlock functionality.
- **No Telemetry**: No crash logs or usage metrics containing user code are sent to Zelvior Labs.

---

## 3. Client-Side Storage Architecture (IndexedDB Only)

To provide convenience features such as favorite tools, recently visited utilities, and custom code snippets, Zelvior DevKit stores data locally in your browser using the **W3C IndexedDB API**:

- **Database Name**: `zelvior_devkit_db`
- **Object Stores**:
  1. `settings`: User preferences (e.g., Theme mode: System, Dark, or Light).
  2. `favorites`: Array of tool IDs pinned by the user.
  3. `recentTools`: List of recently accessed utilities and timestamps.
  4. `snippets`: Custom text snippets saved by the user.
  5. `customPresets`: Saved configuration presets for individual tools.
  6. `searchHistory`: Transient search queries for fast keyboard autocomplete.

### Security Exclusion
Passwords, private keys, HMAC secret keys, and JWT signatures processed within security tools are **never persisted** to IndexedDB or disk. They remain strictly in volatile component memory and vanish immediately upon page refresh or view navigation.

### Data Control & Purge
You maintain total sovereignty over your local data:
- **Export Backup**: Download your bookmarks, preferences, and snippets as a verified `.json` file at any time.
- **Import Backup**: Restore your preferences on another browser without remote sync.
- **Purge All**: Wipe the entire IndexedDB database with a single click from the **Data Management** panel or Sidebar.

---

## 4. Third-Party Network Requests

When you open Zelvior DevKit:
- **Static Assets**: HTML, CSS, JavaScript, and SVG brand assets are loaded either from your self-hosted server or CDN (such as Vercel). Once cached via the Service Worker, Zelvior DevKit works completely **offline**.
- **External Web Fonts**: Google Fonts (`Plus Jakarta Sans` and `JetBrains Mono`) are referenced for typography styling. No identifying user data is shared with Google Fonts.
- **No API Calls**: The core application makes zero remote API calls during operation.

---

## 5. Contact & Questions

If you have questions regarding this Privacy Architecture or wish to audit our client-side implementation, inspect the open-source repository on GitHub or contact:

**Zelvior Labs**  
Email: privacy@zelvior.com  
GitHub: [https://github.com/zelvior/devkit](https://github.com/zelvior/devkit)
