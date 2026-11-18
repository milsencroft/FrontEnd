# Milsen & Croft — Phased build brief (for Claude Code)

Repos: **backend** (database, APIs, webhooks, workers) and **frontend** (Next.js UI).
Each repo has its own CLAUDE.md. Read it first. Build one phase at a time, commit after
each, and stop for review at the end of every phase.

Start by creating, in the backend repo, `supabase/migrations/0001_foundation_catalog_launch.sql`
and `tests/launch-allocation.concurrency.test.ts` (provided alongside this brief).
Apply the migration to a throwaway database and run the test before doing anything else.

## Phase 1 — Foundation (backend, then frontend)
- Backend: migration 0001 applied and tested; `.env.example`; `docs/SETUP.md`;
  Google OAuth config notes; Super Admin bootstrap from `SUPER_ADMIN_EMAIL`.
- Frontend: project scaffold, design tokens, layout shell, Google sign-in and sign-out,
  access-denied screen, responsive/foldable layout primitives.
- Done when: a Google user signs in, becomes a customer, and a staff account can be
  granted a role by the Super Admin.

## Phase 2 — Catalogue
- Backend: region, product, variant, media and pricing APIs; inventory with reservations
  and movement history; seed Kerala and Japan, Mazha Fresh (MC-KER-001), Seiran Fresh
  (MC-JAP-001), and the four future concepts as `concept` (not purchasable).
- Frontend: Collections, Shop listing and filters, product pages; admin region and product screens.

## Phase 3 — Launch engine
- Backend: migration 0002 (Society tiers, memberships, history, waiting lists, missed
  launches); launch create/edit/publish/pause/cancel APIs with audit reasons;
  reservation expiry job.
- Frontend: Launch page with live allocation progress; admin launch builder.

## Phase 4 — Commerce
- Backend: cart and checkout validation, coupons, shipping and tax, Razorpay order
  creation and verified webhooks, refund fallback, order classification.
- Frontend: cart, checkout, order confirmation, customer order history.

## Phase 5 — Order operations and WhatsApp
- Backend: payment and fulfilment state machines, immutable status history, packing,
  courier and tracking, notification outbox, WhatsApp manual and API modes.
- Frontend: Order Management dashboard, order details, status actions, packing view,
  "Share Tracking Details on WhatsApp" with preview and communication history.
- Interim staff alert for new confirmed orders: in-dashboard badge plus email.

## Phase 6 — Society progression and member area
- Promotion, missed launches, demotion, tier queues, Tier 1 re-entry list, cards and
  certificates, benefits; customer Society dashboard; admin Society management.

## Phase 7 — CMS, reports, hardening
- Homepage and content management, journal, FAQ, policies; reports; rate limiting,
  monitoring, backups; full foldable-device test pass.

## Later
- Google Chat order notifications and staff-space management as a second outbox channel.
  Requires a Google Workspace admin and a Chat app with the right API permissions.

## Open decisions to confirm with the owner
- Super Admin bootstrap via `SUPER_ADMIN_EMAIL` (assumed).
- Reservation hold duration (default 15 minutes, adjustable in admin).
