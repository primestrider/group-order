# Vue 3 Project Structure Guide

## Installation

Create a new project using the CLI:

```bash
npm create primestrider-vue
```

---

This project follows a **feature-based architecture** with clearly separated modules for features, shared utilities, and global plugins with a **scalable Vue 3 starter kit** using Vite, TypeScript, Pinia, Vue Router, TailwindCSS, Vue Query, and best‑practice folder structure. It provides:

- Organized feature‑based architecture
- Built‑in i18n support
- Shared reusable components and models
- Auto‑generated feature scaffolding (`create-feature` script)
- Modern tooling: ESLint, Prettier, TypeScript

Perfect for medium‑to‑large Vue applications that require clean structure, maintainability, and scalability.

---

## 🗂 Folder Structure Overview

```
src/
├── assets/                       # Static styles and assets (CSS, images)
├── main.ts                       # App bootstrap
├── App.vue                       # Root app component

├── features/                     # Feature-specific domains
│   ├── feature-a/
│   │   ├── components/           # UI components specific to feature-a
│   │   ├── languages/            # i18n messages specific to feature-a
│   │   ├── models/               # Types or interfaces
│   │   ├── routes/               # Route configs for feature-a
│   │   ├── services/             # API or business logic
│   │   ├── stores/               # Pinia stores
│   │   └── views/                # Vue page components
│   └── feature-b/                # (Repeat structure for other features)

├── shared/                       # Shared code reused across features
│   ├── components/               # Global reusable components
│   ├── languages/                # Shared i18n messages (e.g. errors, common labels)
│   ├── models/                   # Shared types/interfaces
│   ├── routes/                   # Global or fallback routes
│   └── views/                    # Shared views (e.g. 404 Page)
```

---

### Packages Dependencies

- **vue** – The core Vue 3 framework.
- **vue-router** – Routing system for handling pages.
- **pinia** – State management library.
- **vue-i18n** – Internationalization support.
- **axios** – HTTP client for API calls.
- **@tanstack/vue-query** – Data fetching & caching utilities.
- **@vueuse/core** – Utility composables for Vue.
- **@vueuse/integrations** – Integrations for libraries (e.g., validation, cookies).
- **vee-validate** – Form validation framework.
- **universal-cookie** – Cookie handling.
- **tailwindcss** – Utility-first CSS framework.
- **@tailwindcss/vite** – Tailwind integration for Vite.
- **date-fns** – Date utilities.
- **zod** – Schema validation & parsing.
