# Security Policy — Zelvior DevKit

At **Zelvior Labs**, security and user privacy are foundational engineering principles. Zelvior DevKit is designed from the ground up as a client-side execution environment where sensitive data (such as JSON payloads, private keys, JWTs, hashes, and cryptographic tokens) is never transmitted to any external server.

---

## 1. Architectural Security Guarantees

1. **100% Client-Side Processing**:
   All 41 utilities execute entirely within the local browser runtime using standard Web APIs (such as the W3C Web Cryptography API, Web Workers, and Canvas API).
2. **Zero Remote Transmission**:
   No code, secrets, credentials, or user inputs are logged, transmitted, or proxied through remote servers.
3. **Strict Memory Isolation**:
   Cryptographic keys, JWT signatures, HMAC secrets, and passwords processed in utilities remain strictly within transient component memory. They are explicitly excluded from persistent IndexedDB object stores and backup export files.
4. **Sandboxed Iframe & Storage Policy**:
   No third-party advertising, telemetry scripts, invasive tracking pixels, or external analytics SDKs are permitted in the application codebase.
5. **IndexedDB Strict Storage**:
   Persistent state is restricted exclusively to user bookmarks, recent tool navigation, custom developer snippets, and local UI preferences stored inside the browser's origin-isolated `zelvior_devkit_db`.

---

## 2. Supported Versions

Security updates and patches are actively maintained for the latest major release:

| Version | Supported          |
| ------- | ------------------ |
| 3.x.x   | :white_check_mark: |
| 2.x.x   | :x:                |
| 1.x.x   | :x:                |

---

## 3. Reporting a Vulnerability

If you discover a security vulnerability or privacy leak within Zelvior DevKit:

1. **Do NOT open a public GitHub issue** disclosing security-sensitive bugs.
2. Email a detailed vulnerability report to: **security@zelvior.com** (or reach out to the core maintainers via private disclosure on GitHub).
3. Please include:
   - Type of vulnerability (e.g., unintended network call, memory leak, Cross-Site Scripting).
   - Step-by-step reproduction instructions or proof-of-concept payload.
   - Browser version, operating system, and deployment environment.
   - Any proposed remediation or patch.

### Response Timelines
- **Initial Acknowledgement**: Within 24 hours.
- **Triage & Assessment**: Within 48 hours.
- **Fix & Public Advisory**: Coordinated release within 7 days of confirmation.

---

## 4. Cryptographic Standards

Utilities that perform hashing, key generation, or encryption (such as SHA-256, HMAC, UUID v4, and Password Generation) exclusively employ `window.crypto.subtle` and `window.crypto.getRandomValues()` providing high-entropy, cryptographically strong pseudo-random numbers conforming to RFC 4122 and FIPS 180-4.
