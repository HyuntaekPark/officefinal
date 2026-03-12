# KSA Office Hour Finder

Teacher office hour search and admin management service for Korea Science Academy.

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: Postgres
- Deployment target: Vercel
- Entry HTML: root `index.html`

## Local development

1. Create a Postgres database.
2. Run `backend/database/schema.sql`.
3. Copy `.env.example` to `.env`.
4. Fill in `DATABASE_URL`.
5. Run:

```bash
npm install
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

## Required environment variables

- `DATABASE_URL`
- `ADMIN_ID`
- `ADMIN_PASSWORD`
- `ADMIN_TOKEN`

`ADMIN_ID`, `ADMIN_PASSWORD`, and `ADMIN_TOKEN` have local fallback values, but in production they should be set explicitly in Vercel.

## Vercel deployment

1. Push this project to GitHub.
2. Import the repository in Vercel.
3. Set these environment variables in Vercel:
   - `DATABASE_URL`
   - `ADMIN_ID`
   - `ADMIN_PASSWORD`
   - `ADMIN_TOKEN`
4. Build settings:
   - Build Command: `npm run build:vercel`
   - Output Directory: `dist`
5. Deploy.

## Database setup

Use `backend/database/schema.sql` on your Postgres provider before the first deploy.

Recommended providers for Vercel:

- Neon
- Supabase
- Railway Postgres

## Custom domain

After deploy:

1. Add `ksaofficehour.cloud` in Vercel Project Settings > Domains.
2. Add the DNS records Vercel shows in the domain setup screen.
3. Wait for TLS issuance to complete.

## API endpoints

- `GET /api/teachers`
- `GET /api/teachers/search?name=`
- `GET /api/teachers/by-time?day=&period=`
- `GET /api/teachers/current-office-hour`
- `POST /api/teachers`
- `PUT /api/teachers/:id`
- `DELETE /api/teachers/:id`
