# Milsen & Croft — Backend (CLAUDE.md)

Premium niche fragrance house based in Kerala, India. This repo holds the database,
business logic and privileged server-side APIs. The frontend repo only renders UI.

## Stack
- Supabase (PostgreSQL, Auth with Google OAuth only, Storage)
- TypeScript API service (Node) for everything that needs secrets or the service-role key
- Razorpay (payments), WhatsApp Business Platform (customer messages), email provider
- Google Chat integration is DEFERRED. Do not build it now, but keep the notification
  outbox channel-agnostic so it can be added later without touching order logic.

## Non-negotiable rules
1. Google login only. No passwords, magic links, phone OTP or anonymous login.
   A Google account alone never grants admin access. The first Super Admin is created
   server-side from `SUPER_ADMIN_EMAIL`; all other staff are granted by a Super Admin.
2. Never trust the browser for prices, discounts, stock, totals, payment status,
   membership status, allocation counts or permissions. Recompute everything server-side.
3. Money is integer paise. Never floats.
4. Service-role key, Razorpay secrets, WhatsApp tokens live only in server env vars.
5. Every privileged change writes to `audit_log` (append-only) with actor and reason.
6. Authorisation is enforced twice: in the API and in Row Level Security.
7. Order classification (launch pre-order vs regular retail) is decided server-side.
8. Payment status and fulfilment status are separate state machines. Status history is immutable.

## Launch slot rule (critical)
- Every launch has ONE combined pool, default capacity 100, one slot per customer per launch.
- Flow: `reserve_launch_slot` (before payment) -> create Razorpay order -> verified
  `payment.captured` webhook -> `confirm_launch_slot`.
- Reservation TTL default 15 minutes; set the Razorpay order expiry slightly shorter.
- Remaining = capacity - allocated - active reservations. Launch closes permanently only
  when verified allocations reach capacity.
- If `confirm_launch_slot` returns `full` or `launch_unavailable` after a captured payment,
  trigger an automatic Razorpay refund and notify the customer. This must be rare.
- Webhooks: verify signature, verify amount, be idempotent, never process twice.
- Any change to capacity or any override (pause, cancel, manual close) needs a reason in `audit_log`.

## Society
- Six tiers, caps stored in `society_tiers` and editable by Super Admin only (default 100 each).
- Later launches also fit within the Tier 1 cap. Lowering a cap never removes existing members.
- Membership number format: `MS-[LAUNCH CODE]-T[TIER]-[NUMBER]`.
- One active membership per customer. Cancelled or postponed launches never count as missed.

## Notifications
- Single `notification_outbox` table: unique event ID, idempotent, retries with backoff,
  failures visible in admin and retryable. A failed notification must never block or
  duplicate an order.
- WhatsApp starts in manual-approval mode. Never mark a message delivered because it was
  opened or requested. Only delivery receipts mark delivered.

## Working agreement
- Small, reviewable commits per phase. Migrations are numbered, forward-only, never edited after merge.
- Every migration ships with tests. Concurrency tests are required for allocation and inventory.
- Do not invent tracking numbers, URLs or payment data. Ask when something is missing.
- Keep `.env.example` and `docs/SETUP.md` current.
