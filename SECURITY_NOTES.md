# Security notes

- The browser only uses the Supabase anonymous key. Never put the Supabase service-role key in `.env` used by Vite.
- Media uploads are restricted to active admin accounts by the latest migration.
- The SQL console is read-only and restricted to the owner role. It is still a privileged feature: an owner can read any database table reachable by the function. Do not grant owner access to untrusted users.
- Contact email delivery runs in a Supabase Edge Function. It prefers the `RESEND_API_KEY` Edge Function secret and falls back to the legacy `app_secrets` table; the key is never sent to the browser.
- `create-admin` and `update-owner-credentials` require a valid authenticated session and verify the owner role server-side.
- The first-owner bootstrap is a one-time atomic database operation. Disable public signups before creating the intended first owner account.
- Before production launch, enable the Supabase project protections/rate limits appropriate for the expected traffic and configure `RESEND_FROM_EMAIL` with a real verified Resend sender domain instead of the development fallback.


## Additional hardening in this package

- Public contact submissions enforce name/email/message length limits and reject oversized declared request bodies. Configure platform-level rate limiting or a CAPTCHA provider before a public production launch; application-side validation alone does not stop automated abuse.
- The AI copy endpoint validates the request shape, required text, and declared body size before calling the provider. It still requires an authenticated active administrator.
- Vercel responses include baseline browser security headers. `SAMEORIGIN` is retained because the design preview uses a same-origin iframe.
- External advertisement links opened in a new tab use `noopener noreferrer`.
- The ZIP delivery should not contain `.env`, `node_modules`, or generated `dist`; provide local environment values through `.env` and install dependencies with `npm ci`.

## Production checks that require account access

The following cannot be verified from source files alone: live Supabase RLS policies and deployed migrations, Edge Function secrets/deployments, Storage bucket visibility, authentication provider settings, Resend sender-domain verification, rate limits/CAPTCHA, and the deployed Vercel environment variables. Verify these in the actual provider dashboards before launch.
