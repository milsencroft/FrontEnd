# Milsen & Croft — Frontend (CLAUDE.md)

Next.js, React and TypeScript storefront, customer account and admin dashboard for
Milsen & Croft, a premium niche fragrance house based in Kerala, India.
The backend repo owns the database, business rules and secrets. This repo never does.

## Brand
- Homepage headline: "A sense of place. A lasting impression."
- Colours (revised Nov 2026): Parchment #F7F3EB, Bone #EAE3D5, Noir #16130F, Vetiver #3A4B3E, Brass #92713C (hairlines and small details only), Stone #BDB19C, White #FFFFFF.
  Each place has its own colour: Kerala #24382D (monsoon forest), Japan #1D2733 (indigo ink).
- Elegant serif headings, clean sans-serif body, restrained uppercase navigation,
  generous whitespace and refined, purposeful motion (word reveals, magnetic buttons, tilt cards, parallax, marquee). Always honour prefers-reduced-motion.
- Avoid generic perfume-store templates, heavy gold effects and clutter. Brass is a thin accent, never a large fill.
- Define colours and type as design tokens once; never hard-code hex values in components.

## Rules
1. No secrets in this repo. Only public env vars (Supabase URL, anon key, Razorpay key ID).
2. Google sign-in only, via Supabase Auth. No password or OTP UI anywhere.
3. The UI never decides prices, discounts, stock, totals, payment status, membership or
   permissions. Display what the backend returns; send intent, not results.
4. Admin screens must hide actions the user lacks permission for, but the backend is the
   real gate. Never rely on hidden buttons for security.
5. Draft, archived and concept content must never render on public pages.
6. Launch products are purchasable only on the Launch page, never in the regular Shop
   while the launch is active.

## Launch page behaviour
- Show combined progress, e.g. "72 / 100 allocated, 28 remaining", and note when slots are
  temporarily held by customers mid-payment.
- Checkout starts by asking the backend to reserve a slot. Show the hold countdown.
  If the response is `full` or `closed`, show "Fully Allocated" and never open payment.

## Responsive and foldable support
- Layout adapts to the actual viewport, with no refresh needed on fold, unfold, rotate,
  split-screen or resize.
- Use container queries and fluid grids. No horizontal overflow in any state.
- Where the Viewport Segments / `env(fold-*)` APIs exist, keep key controls (buy buttons,
  totals, pay) off the hinge. Fall back gracefully when unsupported.
- Touch targets at least 44px. Admin order tables must use available width when unfolded
  and collapse to cards when folded.

## Working agreement
- Reusable components, typed API client generated from the backend contract.
- Accessibility: semantic HTML, alt text from the media library, visible focus states.
- Tests for checkout, launch page states and permission-gated admin actions.
- Small commits per phase. Keep `.env.example` current.
