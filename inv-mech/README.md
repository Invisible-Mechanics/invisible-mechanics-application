# Invisible Mechanics Frontend

Next.js frontend for the Invisible Mechanics live-class platform.

## Local Development

```powershell
npm install
npm run dev
```

The frontend expects the FastAPI backend at `NEXT_PUBLIC_API_URL`, defaulting locally to `http://127.0.0.1:8001`.

For local auth cookies, `APP_JWT_SECRET` must match the backend's `APP_JWT_SECRET`.

## Deployment

Use this folder as the Vercel project root. Configure these environment variables in Vercel:

```text
NEXT_PUBLIC_SITE_URL=https://your-web-domain
NEXT_PUBLIC_API_URL=https://your-backend-domain
APP_JWT_SECRET=<same value as backend>
NEXT_PUBLIC_SUPABASE_URL=<if Supabase client flows are enabled>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<if Supabase client flows are enabled>
```
