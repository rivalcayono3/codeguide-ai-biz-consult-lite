# CodeGuide AI Biz Consult Lite: Backend Structure Document

## 1. Backend Architecture

This backend is built on a modern serverless approach using Next.js API routes, combined with managed services for data and authentication. The key architectural patterns are:

- **Serverless Functions (Next.js API routes):** Each API route lives under `src/app/api` and runs as an isolated serverless function (on Vercel). This gives automatic scaling, zero server maintenance, and pay-as-you-go pricing.
- **Layered Structure:** The codebase is split into:
  - **app/** for pages and API routes
  - **components/** for reusable UI blocks
  - **lib/** for service wrappers and database clients
  - **supabase/migrations/** for database schema changes
- **Service Integration Pattern:** Authentication, data access, and AI calls are all encapsulated in their own modules (Clerk, Supabase client, Vercel AI SDK). This makes each part easy to swap or upgrade.

How it supports key goals:

- **Scalability:** Serverless functions automatically scale with traffic. Supabase handles database scaling. No manual server provisioning.
- **Maintainability:** Clear folder conventions and single-purpose modules let developers find and update code quickly.
- **Performance:** Cold starts on Vercel are minimal. Edge caching (for static assets) and fast Postgres queries ensure low latency.

## 2. Database Management

The project uses a managed PostgreSQL database via Supabase. Here’s how data is handled:

- **Database Type:** Relational (SQL). Supabase provides hosting, backups, and a web dashboard.
- **Access Control:** Row Level Security (RLS) policies ensure that each user can only access their own rows. RLS checks the authenticated user's ID against a `user_id` column in every table.
- **Data Flow:**
  1. User fills out a business input form (e.g., company name, goals).
  2. Frontend calls a Next.js API route, passing the form data and the user’s session token.
  3. The API route (server) uses the Supabase client to write the input into `business_inputs`.
  4. After AI content is generated, the API route saves results to `analysis_reports`.
  5. Frontend fetches these reports via additional API endpoints or direct Supabase queries.

## 3. Database Schema

Below is the SQL schema for the main tables. It’s human-readable but also ready to run in a migration.

```sql
-- users table managed by Supabase and Clerk
CREATE TABLE users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  role text DEFAULT 'standard', -- e.g., 'standard', 'premium', 'admin'
  created_at timestamp with time zone DEFAULT now()
);

-- store raw business inputs from users
CREATE TABLE business_inputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  input_data jsonb NOT NULL,  -- store form fields as JSON
  created_at timestamp with time zone DEFAULT now()
);

-- store AI-generated analysis reports
CREATE TABLE analysis_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  input_id uuid REFERENCES business_inputs(id),
  ai_content jsonb,           -- structured AI output in JSON
  status text DEFAULT 'pending', -- 'pending', 'complete', 'failed'
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- optional table for live coaching sessions
CREATE TABLE coaching_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  session_time timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Row Level Security policies (example for analysis_reports)
ALTER TABLE analysis_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see own reports"
  ON analysis_reports
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reports"
  ON analysis_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```  

## 4. API Design and Endpoints

The backend exposes RESTful endpoints via Next.js API routes. Key endpoints include:

- **POST /api/chat**
  - Purpose: Generate an AI report based on user inputs.
  - Workflow:
    1. Receive `business_inputs` JSON and user session.
    2. Save inputs to the database.
    3. Build a prompt template and call OpenAI (or Anthropic) via Vercel AI SDK.
    4. Parse the JSON response.
    5. Save results to `analysis_reports` with status `pending` → `complete`.
    6. Return report ID and status to the client.

- **GET /api/reports**
  - Purpose: Fetch a list of the user’s reports.
  - Returns: Array of `{ id, status, created_at }`.

- **GET /api/reports/[id]**
  - Purpose: Retrieve full content of a specific report.
  - Returns: `{ id, input_data, ai_content, status }`.

- **POST /api/inputs**
  - Purpose: Save or update business input forms (if you want separate CRUD).

Authentication is enforced by Clerk middleware. Each route reads the user’s ID from the session token and only allows data access if RLS policies pass.

## 5. Hosting Solutions

- **Next.js & API Routes:** Hosted on Vercel. Benefits:
  - Global edge network for low-latency responses.
  - Built-in load balancing and autoscaling.
  - Zero-config deployments from Git pushes.
- **Database:** Supabase (PostgreSQL BaaS).
  - Automatic backups, monitoring, and scaling.
- **AI Calls:** Outgoing HTTPS calls to OpenAI or Anthropic; no additional hosting needed.

This setup is cost-effective (pay per usage), reliable (SLA-backed), and requires no server maintenance.

## 6. Infrastructure Components

- **Load Balancer:** Vercel’s edge tier will automatically distribute incoming traffic across regions.
- **Content Delivery Network (CDN):** Vercel serves static assets (JS/CSS/images) over a global CDN.
- **Caching:** 
  - **Server-side**: Response headers can instruct edge caching for static API responses.
  - **Client-side**: Frontend can use SWR or React Query to cache API data.
- **Edge Functions:** Potential to move critical logic (like auth checks) to the edge for sub-50ms latency.
- **Background Jobs:** For long-running AI tasks you can use:
  - Vercel Cron Jobs
  - Supabase Edge Functions
  - A lightweight job queue (e.g., using Supabase `pg_notify` or a third-party worker).

All components work together to ensure fast page loads, quick API responses, and smooth user experience.

## 7. Security Measures

- **Authentication:** Clerk handles sign-up, login, and session management. No manual cookie parsing.
- **Authorization:** 
  - **Row Level Security:** Enforced in PostgreSQL to ensure users only see their own rows.
  - **Role-Based Access:** `role` column in `users` table (`standard`, `premium`, `admin`). Middleware checks roles for expert/review routes.
- **Data Encryption:** 
  - All traffic is over HTTPS (TLS).
  - Database connections use SSL.
- **Secrets Management:** 
  - API keys (OpenAI, Supabase, Clerk) stored as environment variables in Vercel.
- **Input Validation:** Server-side validation (e.g., using Zod) to prevent malformed data reaching the database or AI API.

## 8. Monitoring and Maintenance

- **Logging & Error Tracking:**
  - Vercel logs API errors automatically.
  - Integrate a tool like Sentry for real-time crash reporting.
- **Performance Monitoring:**
  - Vercel Analytics for latency and traffic insights.
  - Supabase metrics dashboard to track query times and database health.
- **Database Migrations:**
  - Keep SQL changes in `supabase/migrations/`.
  - Use `supabase db push` or `migrate` to apply schema updates.
- **CI/CD:**
  - Deploy on every merge to `main` via Vercel’s Git integration.
  - Use Dependabot for dependency updates.
- **Regular Audits:**
  - Quarterly security reviews.
  - Automated tests for critical API endpoints.

## 9. Conclusion and Overall Backend Summary

The backend for CodeGuide AI Biz Consult Lite is a serverless, scalable, and secure platform that ties together modern frameworks and managed services:

- **Next.js API Routes** on Vercel for zero-maintenance compute
- **Supabase (PostgreSQL)** with Row Level Security for multi-tenant data segregation
- **Clerk** for seamless user authentication and role management
- **Vercel AI SDK** for clean, server-side integration with AI providers

This setup aligns with the project’s goal of quickly launching an AI-powered business consultation tool, while remaining flexible for future extensions—like subscription billing, advanced dashboards, or live coaching sessions. With its clear module boundaries and managed infrastructure, any new team member can easily understand, maintain, and build upon this foundation.