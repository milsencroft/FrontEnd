# Milsen & Croft — Frontend

Next.js 14 (App Router) + Tailwind. Public env vars only; see `.env.example`.

```
npm install
cp .env.example .env.local   # fill NEXT_PUBLIC_SUPABASE_ANON_KEY and NEXT_PUBLIC_RAZORPAY_KEY_ID
npm run dev
npm test && npm run typecheck && npm run build
```

Deploy: import the repo in Vercel, add the same `NEXT_PUBLIC_*` variables, then add the Vercel URL to
Supabase Auth > URL Configuration (Site URL + Redirect URLs `/auth/callback`) and to Google OAuth origins.
Vercel Hobby is non-commercial: move to a paid plan or another host before taking real orders.
