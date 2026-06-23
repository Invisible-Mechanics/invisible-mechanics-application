# Invisible Mechanics Frontend

Next.js frontend for the Invisible Mechanics live-class platform.

## Local Development

```powershell
npm install
npm run dev
```

The frontend expects the FastAPI backend at `NEXT_PUBLIC_API_URL`. For local development this is `http://127.0.0.1:8001`.

## Deployment

Deploy this repository directly to Vercel. The project root is this folder.

Set these Vercel environment variables:

```text
NEXT_PUBLIC_SITE_URL=https://your-vercel-app.vercel.app
NEXT_PUBLIC_API_URL=https://your-deployed-backend-url
APP_JWT_SECRET=<same value as backend>
```

Do not add backend secrets such as `DATABASE_URL`, `RAZORPAY_KEY_SECRET`, `RESEND_API_KEY`, or Cloudflare private keys to Vercel.
