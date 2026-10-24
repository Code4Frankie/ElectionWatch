# Voter Witness 2027 - Frontend (Next.js)

```bash
cp .env.example .env.local   # point NEXT_PUBLIC_API_URL at the backend (/api included)
npm install
npm run dev                  # http://localhost:3000
```
Backend must allow this origin in `CORS_ORIGINS`. Deploy on Vercel with `NEXT_PUBLIC_API_URL` set.

Pages: `/` login, `/report/new` incident form, `/dashboard` queue (observers see only their own), `/dashboard/[id]` detail, review actions and history.

Not built yet: admin user management screen, stats charts, offline queueing for poor connectivity, Hausa translation, automated tests. Tokens sit in localStorage for the pilot; move to httpOnly cookies before wider rollout.
