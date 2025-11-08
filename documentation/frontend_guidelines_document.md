# Frontend Guideline Document

This document outlines the frontend architecture, design principles, and technologies used in the **CodeGuide AI Biz Consult Lite** project. It is written in straightforward language to ensure any team member or stakeholder can understand the setup.

---

## 1. Frontend Architecture

**Framework & Language**
- **Next.js 15** with the App Router: gives us file-based routing, server and client components, and built-in performance optimizations.
- **TypeScript**: ensures type safety and better developer tooling.

**Key Libraries & Services**
- **Clerk**: handles user authentication, registration, sessions, and role-based access.
- **Supabase**: PostgreSQL database as a service with Row Level Security (RLS) for per-user data isolation.
- **Vercel AI SDK**: wraps calls to OpenAI/Anthropic Claude for generating AI-powered reports.
- **shadcn/ui**: a collection of accessible React UI components.
- **Tailwind CSS** v4: utility-first styling framework with dark mode support.
- **next-themes**: theme toggling (light/dark) at runtime.

**How It Fits Together**
1. **App Router** manages page navigation and API routes.
2. **ClerkProvider** and **ThemeProvider** wrap the entire app in `layout.tsx` for global auth and theming.
3. **Supabase client** lives in `src/lib/supabase.ts`, handling database calls with RLS.
4. **AI API route** (`/api/chat/route.ts`) proxies requests to OpenAI/Claude and saves results to Supabase.
5. **UI components** in `src/components/ui/` are built with shadcn/ui & styled by Tailwind.

**Scalability & Maintainability**
- **File-based structure** (`app/`, `components/`, `lib/`, `supabase/migrations`) keeps code organized.
- **Component-driven** development ensures pieces can be reused and updated independently.
- **Server and client components** in Next.js let us optimize data fetching and rendering.

---

## 2. Design Principles

1. **Usability**: intuitive layouts, clear input forms, guided interactions.
2. **Accessibility**: built-in a11y in shadcn/ui (proper ARIA, keyboard navigation, focus management).
3. **Responsiveness**: mobile-first design using responsive utilities in Tailwind.
4. **Consistency**: uniform styling (buttons, inputs, cards) via a shared component library.
5. **Performance**: lazy-load non-critical pieces, optimize assets.

**Applying These Principles**
- Forms guide users step by step when submitting business data.
- Tabbed and accordion views break down long AI reports into digestible sections.
- Dark mode support ensures readability in all lighting conditions.

---

## 3. Styling and Theming

**Styling Approach**
- **Tailwind CSS**: utility classes for spacing, typography, color, layout.
- **No global CSS** except for theme overrides; all styling lives in component files.

**Theming**
- **next-themes** toggles `data-theme="light"` and `data-theme="dark"` on `<html>`.
- Colors adjust automatically based on theme using CSS variables defined in `tailwind.config.js`.

**Visual Style**
- Modern, clean, slightly minimal. Light use of glassmorphism on cards and panels (soft backdrop blur).
- Smooth transitions between states (hover, focus).

**Color Palette**
- **Primary**: #4F46E5 (indigo-600) / #6366F1 (indigo-500)
- **Secondary**: #10B981 (emerald-500) / #059669 (emerald-600)
- **Neutral Light**: #F9FAFB (gray-50), #E5E7EB (gray-200)
- **Neutral Dark**: #1F2937 (gray-800), #111827 (gray-900)
- **Accent (info)**: #3B82F6 (blue-500)

**Typography**
- **Font Family**: Inter, fallback to system-ui.
- **Sizing**: fluid type scale (text-sm, text-base, text-lg, etc.)

---

## 4. Component Structure

**Organization**
- `src/components/ui/`: shared UI primitives (Button, Input, Card, Tabs, Accordion).
- `src/components/feature/`: feature-specific components (e.g., BusinessInputForm, ReportViewer).

**Reusability**
- Each component is a self-contained folder with its `.tsx`, test file, and styles.
- Props-driven design: behavior and content passed in via props.

**Benefits**
- Smaller, predictable files make maintenance easier.
- Updates to a UI primitive propagate across the app consistently.

---

## 5. State Management

**Server State**
- **TanStack Query (React Query)**: handles fetching, caching, and syncing data (e.g., user reports, form submissions).
- Automatic refetch-on-window-focus and background updating.

**Client State**
- **Zustand** (or Jotai): lightweight stores for UI state (e.g., modal open/close, theme override).

**Authentication State**
- Managed by Clerk’s React hooks (`useUser`, `useSession`), no extra code required.

**How State Flows**
1. User submits business data → TanStack Query mutation → server route stores in Supabase.
2. On success → query invalidation triggers refetch of report list.
3. UI components react to store state (e.g., loading spinners, error toasts).

---

## 6. Routing and Navigation

**Routing**
- **Next.js App Router**: file-based routing under `src/app/`.
- Layouts (`layout.tsx`) define shared UI (nav bar, footers).
- Nested folders define nested routes (e.g., `/report/[id]/layout.tsx`).

**Protected Routes**
- **Clerk middleware** (`middleware.ts`): automatically redirects unauthenticated users to sign-in pages.
- Role-based access (e.g., expert reviewers) checked via custom metadata in Clerk and enforced in middleware or server components.

**Navigation UI**
- Global nav component with links to Dashboard, New Analysis, Reports.
- Highlight active route courtesy of Next.js link prefetching.

---

## 7. Performance Optimization

1. **Code Splitting & Lazy Loading**
   - Use `next/dynamic` to load heavy components (like the AI report viewer) only when needed.
2. **Image Optimization**
   - Next.js `<Image>` component serves properly sized, optimized images.
3. **Tailwind Purge**
   - Unused CSS classes removed in production builds.
4. **API Response Caching**
   - TanStack Query caches server data to avoid unnecessary refetches.
5. **Server Components**
   - Leverage Next.js server components for data-heavy routes to minimize client bundle size.

---

## 8. Testing and Quality Assurance

**Unit & Integration Tests**
- **Jest** with **React Testing Library** for component and hook tests.
- Write tests for form validation, UI states (loading, error, success).

**End-to-End Tests**
- **Cypress**: simulate user flows like sign-up, login, submitting business inputs, viewing reports.

**Linting & Type Checking**
- **ESLint**: enforces code style consistent with Airbnb or custom config.
- **Prettier**: automatic code formatting.
- **TypeScript**: strict mode enabled, catches type errors at build time.

**CI/CD Integration**
- Run tests, lint, and type checks on every PR via GitHub Actions.

---

## 9. Conclusion and Overall Frontend Summary

This Frontend Guideline Document has covered:
- A **modern architecture** using Next.js, TypeScript, Tailwind, and AI integrations.
- **Design principles** focused on usability, accessibility, and performance.
- A **consistent styling approach** with Tailwind and shadcn/ui, plus theming support.
- A **component-driven structure** that promotes reuse and maintainability.
- A **scalable state management** plan with TanStack Query and Zustand.
- **Routing, optimization, and testing** practices to ensure a solid user experience and high code quality.

Together, these guidelines align the frontend setup with the project’s goals of delivering a fast, secure, and user-friendly AI business consultation platform. The combination of robust tooling and clear conventions makes it easy for any developer, whether new to the codebase or an experienced contributor, to build, maintain, and extend the application with confidence.

---

*End of Document*