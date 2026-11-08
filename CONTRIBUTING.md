# Contributing to Zelvior DevKit

Thank you for your interest in contributing to **Zelvior DevKit**! We welcome bug fixes, documentation improvements, performance optimizations, and new developer utilities from the global developer community.

---

## 1. Core Principles

Before proposing any changes, please review our foundational design and engineering principles:

- **100% Client-Side Execution**: Every utility must execute entirely within the local browser runtime. Never introduce backend services, external APIs, telemetry, or remote proxying.
- **IndexedDB-Only Persistence**: All persistent storage must pass through `src/lib/db.ts` (`zelvior_devkit_db`). Do NOT use `localStorage`, `sessionStorage`, or cookies.
- **Sensitive Data Isolation**: Passwords, private keys, HMAC secrets, and JWT tokens must remain volatile in-memory only.
- **Monochrome Design Discipline**: Follow Zelvior's refined black-and-white aesthetic. Do not add generic AI gradients, colored neon borders, or excessive decorative clutter.
- **High Performance & Accessibility**: Ensure zero UI freeze during heavy computations (use Web Workers where needed). All interactive buttons must have accessible labels and keyboard focus states.

---

## 2. Development Setup

### Prerequisites
- Node.js 18+ (Node 20+ recommended)
- npm or pnpm

### Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/zelvior/devkit.git
cd devkit

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
# Local dev server runs at http://localhost:3000
```

### Verification & Quality Checks

Before submitting a Pull Request, run the linter and production build:

```bash
# Type check and lint
npm run lint

# Production compilation
npm run build
```

---

## 3. Adding a New Developer Utility

To add a new tool to Zelvior DevKit:

1. **Define the Tool in `src/config/tools.ts`**:
   Add a typed `ToolDefinition` entry specifying its `id`, `name`, `description`, `category`, and relevant search `keywords`.
2. **Implement the Utility Component**:
   Create or extend the corresponding category view component in `src/components/tools/`.
   - Provide clean Input and Output sections.
   - Include actionable controls (Copy, Clear, Download, Sample Data).
   - Display informative status indicators (size in bytes, line counts, execution time).
   - Implement comprehensive error handling with inline validation.
3. **Register Route & Category Mapping**:
   Ensure the tool is navigable via the command palette (⌘K) and category filters.
4. **Update Test/Type Suite**:
   Verify that `tsc --noEmit` and `npm run build` succeed with zero errors.

---

## 4. Pull Request Guidelines

1. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/my-new-utility
   ```
2. **Commit Message Conventions**:
   Follow conventional commit standards:
   - `feat(tool): add GraphQL query formatter`
   - `fix(db): handle transaction upgrade race condition`
   - `docs(readme): update feature matrix for v3`
   - `refactor(ui): improve touch target spacing on mobile`
3. **Submit PR**:
   - Provide a clear description of the problem solved or utility added.
   - Attach screenshots or recordings demonstrating responsive behavior in both dark and light modes.
   - Confirm that all client-side privacy guarantees are maintained.

---

## 5. Community & Code of Conduct

All contributors are expected to uphold the standards described in our [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md). Be respectful, constructive, and collaborative.
