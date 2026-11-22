# Prompt for Claude Code: frontend (run in the FrontEnd folder, after the API exists)

Read CLAUDE.md first. Build the Next.js (App Router) + TypeScript + Tailwind frontend.

Backend facts you can rely on (already built, do not change the database):
- Supabase project https://gnnbgewcmheuhdlxhyue.supabase.co, Google sign-in only via Supabase Auth.
- Launch KJ (Kerala x Japan): 100 combined slots, one slot per customer, pre-order Rs 999 per 50 ml bottle.
  Regular shop price Rs 1499. Duo pack (1 Kerala + 1 Japan) Rs 1999, regular shop only.
- All prices come from the API in paise; format as Indian rupees. GST may be shown as inclusive or added at
  checkout depending on the backend's GST setting: render whatever breakdown the API returns.
- Product images live in the public Supabase Storage bucket `product-media`.

Build in this order, one branch per step, small commits:
1. Design tokens (colours, type scale), layout shell, responsive + foldable-aware grid, header/footer.
2. Public pages: Home ("A sense of place. A lasting impression."), Regions, Product detail, Launch page
   with live slot counter and Fully Allocated state, About, legal placeholders. Only published content renders.
3. Auth: "Continue with Google" only, account page (orders, Society membership, WhatsApp consent).
4. Checkout: reserve slot -> hold countdown -> Razorpay Checkout (key id only) -> confirmation page driven by
   the backend's order/payment status (never by the browser callback alone).
5. Admin dashboard: role-aware navigation, launches, catalogue, orders (card layout when folded),
   inventory, GST toggle (Super Admin only), staff and roles (Super Admin only).
6. Tests for launch states, checkout failure paths and permission-gated admin actions.

Never put secrets in this repo. Ask before inventing copy, prices or product notes.
