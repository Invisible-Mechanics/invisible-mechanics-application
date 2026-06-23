# Invisible Mechanics Application

Split deployment layout for the Invisible Mechanics live-class platform.

## Structure

```text
.
├── inv-mech/          # Next.js frontend
├── backend/           # FastAPI backend
├── infra/             # Local infrastructure helpers
└── package.json       # Local launcher for both apps
```

## Local Development

Install once at the root:

```powershell
npm install
```

Then run both apps together:

```powershell
npm run dev
```

Frontend: http://localhost:3000
Backend: http://localhost:8001

For the smoothest local run, build once and start the production server:

```powershell
npm run build:web
npm run start:prod
```

You can also run each app separately:

```powershell
npm --prefix inv-mech run dev
cd backend
uv run uvicorn app.main:app --reload --port 8000
```

## Deployment

Deploy `inv-mech/` as the Vercel project root. Set `NEXT_PUBLIC_API_URL` to the backend URL and set `APP_JWT_SECRET` to the same value used by the backend.

Deploy `backend/` as the Python/container service root. The included Dockerfile starts FastAPI on `$PORT` for container hosts.
