# Security Guidelines for CodeGuide AI Biz Consult Lite

This document outlines actionable security best practices tailored to the CodeGuide AI Biz Consult Lite starter template. By following these guidelines, youll embed security by design into every layer of your Next.js application, from authentication and data persistence to AI integration and deployment.

## 1. Authentication & Access Control

- **Leverage Clerk Securely**  
  • Ensure Clerk middleware (`middleware.ts`) protects all sensitive routes (e.g., `/dashboard`, `/new-analysis`, `/expert-review`).  
  • Enforce role-based access by assigning custom metadata or roles in Clerk (e.g., `standard`, `premium`, `admin`) and checking these roles in both middleware and server components.  
  • Implement logout endpoints and idle/absolute session timeouts via Clerk settings.  
  • Protect against session fixation and replay by using Clerks built-in token rotation.

- **Principle of Least Privilege**  
  Grant only the minimal permissions needed in your Supabase RLS policies. For instance, allow `SELECT` on `analysis_reports` for `auth.uid() = user_id` and block all other users.

## 2. Input Handling & Processing

- **Server-Side Validation**  
  • Use a schema validation library (e.g., Zod) in API routes (`/api/chat/route.ts` and any new endpoints) to enforce type, range, length, and format constraints on incoming JSON.  
  • Reject requests with missing or invalid fields before any database or AI calls.

- **Prevent Injection Attacks**  
  • Always use parameterized queries via the Supabase client (or an ORM like Drizzle/Prisma) to eliminate SQL injection risks.  
  • If you accept Markdown or HTML from users, sanitize it server-side with a library like DOMPurify to prevent XSS and template injection.

- **Structured AI Prompts**  
  • Construct your AI prompt templates in code (avoid string concatenation) and validate that any dynamic insertion does not introduce unintended tokens or control characters.

## 3. Data Protection & Privacy

- **Encrypt Data in Transit & at Rest**  
  • Vercel and Supabase default to TLS—verify youre enforcing HTTPS via `next.config.js` redirects and HSTS headers.  
  • Confirm Supabase storage uses encrypted volumes. For additional PII (if introduced), consider field-level encryption in the application layer.

- **Secure Secrets Management**  
  • Store API keys and database URLs exclusively in environment variables (e.g., Vercel Dashboard).  
  • Do NOT commit `.env.local` or secret values to source control.  
  • For production, use a secrets manager (e.g., AWS Secrets Manager or HashiCorp Vault) where possible.

- **Minimal PII Exposure**  
  • Avoid logging or returning sensitive user data (email, user IDs) in API responses and error messages.  
  • Implement data masking or redaction in logs.

## 4. API & Service Security

- **Rate Limiting & Throttling**  
  • Protect `/api/chat/route.ts` and any new endpoints against abuse by implementing rate limits (e.g., via `express-rate-limit` middleware or Vercel Edge Middleware).  
  • For AI endpoints, enforce per-user quotas or credit balances in Supabase.

- **Strict CORS Configuration**  
  • In Next.js API routes, set `Access-Control-Allow-Origin` only to your trusted domains.  
  • Avoid using wildcard (`*`) in production.

- **Proper HTTP Methods & Status Codes**  
  • Use POST for state-changing operations (`/api/chat`), GET for safe data retrieval (e.g., `/api/reports/[id]`).  
  • Return appropriate 4xx/5xx status codes and generic error messages (avoid leaking stack traces).

## 5. Web Application Security Hygiene

- **Security HTTP Headers**  
  Configure in `next.config.js` under `headers()`:
  • `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  • `X-Frame-Options: DENY`
  • `X-Content-Type-Options: nosniff`
  • `Referrer-Policy: no-referrer`
  • `Content-Security-Policy` restricting scripts/styles to your domains and using SRI for CDN resources

- **CSRF Protection**  
  • For any form or state-changing request from the browser to your APIs, implement an anti-CSRF token (e.g., NextAuth or custom synchronizer token).  
  • If you rely on Clerks built-in frontend, verify it covers CSRF for its endpoints.

- **Secure Cookies**  
  Ensure all cookies set by Clerk or your application use:
  • `HttpOnly` to prevent JavaScript access  
  • `Secure` to allow transmission only over HTTPS  
  • `SameSite=Lax` or `Strict` to mitigate CSRF

## 6. Infrastructure & Configuration Management

- **Environment Hardening**  
  • Disable Next.js debugging and sourcemaps in production.  
  • Remove any unused Vercel environment variables and preview branches that expose staging data.

- **Regular Patching & Updates**  
  
  • Keep your Next.js, React, Tailwind, shadcn/ui, and Vercel SDK dependencies up to date.  
  • Enable Dependabot or a similar service to automatically open pull requests for version bumps.

- **File & Directory Permissions**  
  
  • On your development and CI/CD servers, restrict write access to configuration files and secret stores.  
  • Ensure migrations and generated assets are owned by a non-root user.

## 7. Dependency Management

- **Use Lockfiles**  
  Commit `package-lock.json` or `yarn.lock` to ensure deterministic installs.

- **Vulnerability Scanning**  
  Integrate an SCA tool (e.g., GitHub Advanced Security, Snyk, or npm audit) into your CI pipeline to fail builds on critical CVEs.

- **Minimize Third-Party Footprint**  
  Audit your `dependencies` and `devDependencies` regularly, removing unused packages and avoiding monolithic libraries when lightweight alternatives suffice.

## Appendix: Secure AI Integration Patterns

1.  Validate and sanitize any user-provided parameters before they influence AI prompts.  
2.  Wrap AI calls in `try...catch`; record errors to monitoring (e.g., Sentry) without exposing them to users.  
3.  Store AI responses in the database with a `status` field (`processing`, `complete`, `failed`) and allow users to poll or subscribe to real-time updates via Supabase Realtime.

---
By adhering to these guidelines, youll build a secure, maintainable, and resilient foundation for your AI Business Consultation platform. Always review and update your security controls as your application evolves and new threats emerge.