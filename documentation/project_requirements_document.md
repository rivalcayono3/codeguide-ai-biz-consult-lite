# Project Requirements Document (PRD)

## 1. Project Overview
CodeGuide AI Biz Consult Lite is a fully configured Next.js starter template designed to accelerate the development of an AI-powered business consultation platform. It bundles user authentication (via Clerk), secure data storage (Supabase/PostgreSQL with Row Level Security), a clean TailwindCSS UI (shadcn/ui), and a server-side AI proxy (Vercel AI SDK for OpenAI & Anthropic Claude). By providing all the plumbing—login flows, database migrations, API routes, and UI components—developers can focus on implementing the unique business logic: dynamic input forms, multi-section AI reports, expert review workflows, and subscription controls.

The core problem it solves is the high overhead of wiring up modern web apps with secure auth, data persistence, and AI services. Instead of spending weeks on boilerplate, teams can clone this template and immediately begin defining their `business_inputs`, crafting critical prompts, and rendering structured AI responses. Key objectives for version one are: a smooth sign-up/login experience, a robust data model for user submissions and reports, end-to-end AI report generation, and a responsive, accessible UI. Success is measured by a developer spinning up a working demo in under an afternoon and end users completing a business analysis workflow seamlessly.

## 2. In-Scope vs. Out-of-Scope

### In-Scope (Version 1)
- User registration, login, and session management using Clerk
- PostgreSQL database on Supabase with RLS policies for multi-tenancy
- API route (`/api/chat/route.ts`) that:
  - Receives structured business input from the client
  - Persists `business_inputs` to Supabase
  - Constructs a JSON prompt template and calls OpenAI/Claude via Vercel AI SDK
  - Parses the JSON response and saves it to `analysis_reports` in Supabase
- Basic front-end pages:
  - Landing page with “Get Started” flow
  - Dashboard listing past reports
  - New Analysis form with dynamic fields
  - Report viewer using Tabs/Accordions to display sections
- Dark mode support and accessible UI components (Inputs, Buttons, Cards)
- Middleware protection of routes, ensuring only authenticated users can access dashboard and reports

### Out-of-Scope (Planned for Later Phases)
- Subscription billing & payment integration (e.g., Stripe)
- Expert/Admin review queue UI and workflows
- Live coaching scheduling or video chat
- Asynchronous background job processing for long-running AI tasks
- Role-based access beyond basic authenticated vs. unauthenticated
- Advanced analytics dashboards or financial charting
- Third-party calendar integrations

## 3. User Flow
A new visitor lands on the public homepage, reads a brief overview of the AI consultation service, and clicks “Get Started.” They are prompted to register or log in via Clerk (email/password or OAuth). Upon successful authentication, the user is redirected to their dashboard, which lists any existing business analysis reports and offers a “New Analysis” button.

When the user clicks “New Analysis,” they fill out a multi-field form describing their business details (industry, revenue, challenges, goals, etc.). Upon submission, the form data is sent to `/api/chat/route.ts`, which saves the input, calls the AI model, and returns a processing status. The dashboard shows a “Processing” indicator alongside the new report entry. Once the AI completes the analysis, the report status updates to “Complete,” and the user clicks into the report viewer. The viewer presents each section in Tabs and Accordions, allowing the user to drill into recommendations, financial projections, and next steps.

## 4. Core Features
- **Authentication & Authorization**: Clerk-based signup, login, session, and middleware route protection
- **Database Schema & RLS**: Supabase tables for `users`, `business_inputs`, `analysis_reports` with row-level security ensuring each user sees only their own data
- **AI Report Generation API**:
  - Receives JSON input
  - Saves inputs to Supabase
  - Builds a structured prompt for OpenAI/Claude
  - Invokes the Vercel AI SDK and awaits response
  - Parses JSON response and updates the `analysis_reports` record
- **Dynamic Input Form Component**: Multi-field, validated form using Zod (optional) on client and server
- **Report Viewer**: Tabs and Accordion components that render AI-generated report sections, allow copying or exporting
- **UI/UX**: responsive layout, dark mode toggle, accessible keyboard navigation
- **Routing & Navigation**: Next.js App Router with protected `/dashboard`, `/new-analysis`, and `/report/[id]` routes

## 5. Tech Stack & Tools
- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Styling & UI**: TailwindCSS v4, shadcn/ui component library, `next-themes` for dark mode
- **Authentication**: Clerk
- **Backend & Database**: Supabase (PostgreSQL) with RLS, migrations in `supabase/migrations/`
- **AI Integration**: Vercel AI SDK, OpenAI GPT-4/3.5, Anthropic Claude
- **API Routes**: Next.js Serverless Functions (`/api/chat/route.ts`)
- **Validation**: Zod (recommended) for request schema validation
- **IDE/Plugins**: VS Code with TypeScript, Tailwind CSS IntelliSense, Clerk VS Code extension (optional)

## 6. Non-Functional Requirements
- **Performance**: 
  - Initial page load ≤ 2 seconds on a 3G network
  - TTFB (Time to First Byte) ≤ 200ms on dashboard and report routes
- **Scalability**: Supabase can handle multi-tenant data, but AI calls rate limit to OpenAI/Claude quotas
- **Security**:
  - All API routes require authentication
  - Database RLS prevents cross-user data leaks
  - AI API key never exposed to client
  - TLS encryption in transit, at-rest encryption via Supabase
- **Accessibility**: WCAG 2.1 AA standards—semantic HTML, ARIA roles, focus management
- **Usability**: Simple, intuitive form flows with inline validation messages

## 7. Constraints & Assumptions
- **GPT-4/Claude Access**: Requires valid API keys and sufficient quota
- **Hosting**: Deployed on Vercel Hobby or Pro; serverless function timeouts (~10–15s) apply
- **Database**: Supabase project with enabled Row Level Security
- **User Base**: Assumed low-to-medium concurrent users initially
- **Network**: Stable internet for AI calls—no offline support

## 8. Known Issues & Potential Pitfalls
- **Function Timeouts**: Long AI responses may exceed serverless limits. Mitigation: return a “processing” status and poll or use Supabase Realtime for updates.
- **Prompt Size & Token Limits**: Large user inputs can push prompts past model limits. Mitigation: enforce character limits or break reports into chunks.
- **Error Handling**: AI service errors or rate limits can fail silently. Mitigation: wrap AI calls in `try…catch`, log errors, update report status to `failed`, and show retry options.
- **Data Validation**: Malformed inputs can break prompt templates. Mitigation: adopt Zod schemas on both client and server side.
- **Cost Overruns**: Frequent GPT-4 calls can be expensive. Mitigation: consider model fallbacks (GPT-3.5) for non-critical tasks.

---

This PRD provides a clear, unambiguous guide for the AI model or development team to build, extend, and maintain the CodeGuide AI Biz Consult Lite starter, ensuring consistent implementation of core features, security policies, and user workflows.