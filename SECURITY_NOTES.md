# Security notes

- The browser only uses the Supabase anonymous key. Never put the Supabase service-role key in `.env` used by Vite.
- Media uploads are restricted to active admin accounts by the latest migration.
- The SQL console is read-only and restricted to the owner role. It is still a privileged feature: an owner can read any database table reachable by the function. Do not grant owner access to untrusted users.
- Contact email delivery runs in a Supabase Edge Function and reads `RESEND_API_KEY` from `app_secrets`; the key is never sent to the browser.
- Before production launch, enable the Supabase project protections/rate limits appropriate for the expected traffic and configure a real verified Resend sender domain instead of `onboarding@resend.dev`.
