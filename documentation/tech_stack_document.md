# Tech Stack Document for CodeGuide AI Biz Consult Lite

This document explains the technology choices behind the CodeGuide AI Biz Consult Lite starter template. It’s written in simple, everyday language so you can understand how each piece works and why we picked it.

## 1. Frontend Technologies

These are the building blocks for everything you see in your browser, from pages to buttons and color themes:

- **Next.js 15 (App Router)**
  - A modern framework that makes building and organizing pages easy. It handles page routing, server-side rendering, and performance optimizations out of the box.
- **TypeScript**
  - A superset of JavaScript that adds type checking. It helps catch errors early, making the code more reliable.
- **Tailwind CSS v4**
  - A utility-first styling tool. Instead of writing custom CSS files, you compose small utility classes directly in your HTML/JSX for fast and consistent design.
- **shadcn/ui**
  - A pre-built component library (buttons, inputs, tabs, accordions) that works hand-in-hand with Tailwind CSS to speed up UI development while keeping things accessible and responsive.
- **next-themes**
  - Manages light/dark mode switches automatically, giving users a consistent theme experience without extra setup.

How these improve user experience:
- Consistent, responsive design without reinventing the wheel.
- Faster development with reusable components.
- Better performance and SEO thanks to Next.js’s built-in optimizations.
- Clear, type-checked code that reduces bugs.

## 2. Backend Technologies

These handle data storage, user management, and the server logic that powers your AI features:

- **Next.js API Routes**
  - Built-in server endpoints where we run our logic, like saving form data or calling AI models. They live alongside your pages and share the same codebase.
- **Supabase (PostgreSQL)**
  - A managed database service that uses PostgreSQL. It stores user inputs, generated reports, and any future data (like coaching sessions).
  - **Row Level Security (RLS)** ensures each user can only see their own data.
- **Clerk**
  - Handles user sign-up, login, and sessions. It comes with pre-built forms and secure middleware to protect routes without manual setup.
- **Vercel AI SDK**
  - A helper library for calling AI models (OpenAI GPT-4/3.5 and Anthropic Claude) from our API routes. It makes integrating chat or report generation simple and secure.

How these work together:
1. A user fills out a form in the browser.
2. The form data travels to a Next.js API Route.
3. We save the input to Supabase and then call the AI model via the Vercel AI SDK.
4. The AI’s response is parsed and stored in the database.
5. The user sees the generated report in the UI.

## 3. Infrastructure and Deployment

This section covers where your app lives, how code changes go live, and how we keep everything organized:

- **Vercel**
  - Hosting platform designed for Next.js apps. Automatically builds and deploys on each Git push, with preview URLs for testing.
- **GitHub (or similar)**
  - Version control system where your codebase lives. Tracks changes, lets teams collaborate, and integrates with Vercel for automatic deployments.
- **Supabase Migrations**
  - A folder in the repo for database schema changes. You write simple SQL files to create or update tables, and Supabase applies them in order.
- **Environment Variables**
  - Securely store keys (like API tokens for OpenAI or Clerk) outside your code. Vercel reads these and makes them available at build and run time.

Why this setup matters:
- **Reliability:** Vercel’s global network and atomic deploys mean minimal downtime.
- **Scalability:** The app can grow without manual server provisioning.
- **Ease of Use:** Push code to GitHub, see live updates in minutes.

## 4. Third-Party Integrations

We’ve plugged in several external services to handle specialized tasks so you can focus on your core features:

- **Clerk** for authentication (user sign-up, login, session management)
- **Supabase** for database storage with built-in security rules (RLS)
- **OpenAI GPT and Anthropic Claude** via the **Vercel AI SDK** for AI-powered report generation
- **Stripe** (recommended) for handling payments and subscriptions
- **Calendly** or similar (optional) for scheduling live coaching sessions

Benefits of these integrations:
- No need to build complex features from scratch (auth, payments, scheduling).
- Secure, enterprise-grade services manage sensitive data.
- Plug-and-play APIs that streamline development.

## 5. Security and Performance Considerations

We’ve put measures in place to keep data safe and the app running smoothly:

Security:
- **Authentication & Authorization** with Clerk and Next.js middleware to protect routes.
- **Database Row Level Security (RLS)** in Supabase to ensure users only access their own records.
- **Server-Side AI Proxy** (API Route) hides your OpenAI API key and allows us to validate and sanitize inputs before sending them to AI models.
- **Input Validation** (recommended with a library like Zod) to verify data before it’s stored.

Performance:
- **Edge Deployments** on Vercel for low-latency responses around the globe.
- **Tailwind’s JIT Compiler** generates only the CSS you use, keeping file sizes small.
- **Background Processing** recommendation: offload long-running AI jobs to asynchronous tasks (Supabase Edge Functions or Vercel Cron Jobs) so the user interface stays responsive.
- **Caching & State Management** plugins (like TanStack Query or SWR) can be added to reduce repeated data fetching and improve perceived speed.

## 6. Conclusion and Overall Tech Stack Summary

In summary, CodeGuide AI Biz Consult Lite brings together a modern set of tools that work seamlessly:

- Frontend: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, next-themes
- Backend: Next.js API Routes, Supabase (PostgreSQL + RLS), Clerk, Vercel AI SDK
- Infrastructure: Vercel hosting, GitHub version control, environment variables, Supabase migrations
- Integrations: OpenAI & Anthropic, Stripe, Calendly (optional)

These choices align with the project’s goal of delivering a robust, secure, and easy-to-extend foundation for AI-driven business consultation. The unique combination of built-in auth, database-level security, and AI tooling sets this starter apart, enabling teams to focus on their unique business logic and user experience rather than reinventing core infrastructure.