# Live Class Platform — Build Plan

**Type:** Standalone interactive live-class website (separate from the IM adaptive platform)
**Educator:** Solo (you = the only teacher + admin)
**Monetization:** Mixed — one-time cohort enrollment + monthly subscription + pay-per-class, with a free preview tier
**Stack:** Next.js (frontend) · FastAPI (backend) · PostgreSQL · Zoom Meeting SDK + API · Razorpay

---

## 1. The one decision everything hangs on: the entitlement model

Because a student can earn access to a class through **four** different paths (free tier, cohort enrollment, active subscription, single-class purchase), do **not** check access by asking "did they buy this cohort?" or "do they have a sub?" in every route. That logic will rot.

Instead, every payment path writes a row into a single `entitlements` table. Access to any class is then one question:

> *Does this user hold a valid entitlement that covers this class right now?*

This keeps Razorpay flows, free grants, and admin comps all funnelling into the same gate. Add a new payment model later (annual plan, referral comp, scholarship) → it's just a new `source` value, zero changes to the access check.

```
can_access(user, class):
    if class.access_type == 'free':            return True
    return exists entitlement E where
        E.user_id == user.id
        AND E.status == 'active'
        AND (E.valid_until IS NULL OR E.valid_until > now())
        AND (
            (E.scope_type == 'all_access')                       # subscription
            OR (E.scope_type == 'cohort' AND E.scope_id == class.cohort_id)   # cohort
            OR (E.scope_type == 'class'  AND E.scope_id == class.id)          # single purchase
        )
```

---

## 2. Data model

Core tables (PostgreSQL). Types abbreviated; assume `id` = UUID PK, timestamps = `timestamptz`.

### users
```
id, name, email (unique), phone, role ('student' | 'admin'),
source ('youtube' | 'direct' | ...),   -- for funnel attribution
created_at
```
Only one `admin` row (you). No multi-teacher tables needed.

### classes
```
id, title, description, subject, topic,
scheduled_start, duration_min,
access_type ('free' | 'paid'),
cohort_id (nullable FK),               -- if part of a batch
price_single (nullable),               -- enables pay-per-class for this class
zoom_meeting_id, zoom_join_url, zoom_password,
status ('scheduled' | 'live' | 'ended'),
created_at
```

### cohorts
```
id, title, description,
price, early_bird_price, early_bird_deadline,
seat_limit, seats_taken,
start_date, end_date,
status ('open' | 'closed' | 'completed'),
created_at
```

### subscription_plans
```
id, name, price, interval ('monthly'),
razorpay_plan_id,                      -- created once in Razorpay
unlocks ('all_live' | 'all_live_plus_recordings'),
active, created_at
```

### subscriptions
```
id, user_id, plan_id,
razorpay_subscription_id,
status ('created'|'active'|'halted'|'cancelled'|'completed'),
current_period_end,                    -- drives entitlement.valid_until
created_at
```

### entitlements  ← the heart of the system
```sql
CREATE TABLE entitlements (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id),
  scope_type  text NOT NULL,           -- 'class' | 'cohort' | 'all_access'
  scope_id    uuid,                     -- class_id or cohort_id; NULL for all_access
  source      text NOT NULL,            -- 'single_purchase'|'cohort_enrollment'|'subscription'|'free_grant'
  valid_from  timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz,              -- NULL = perpetual; subscriptions set this rolling
  status      text NOT NULL DEFAULT 'active',  -- 'active' | 'revoked'
  payment_id  uuid REFERENCES payments(id),
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON entitlements (user_id, scope_type, scope_id) WHERE status = 'active';
```

### payments
```
id, user_id,
razorpay_order_id, razorpay_payment_id, razorpay_signature,
amount, currency, status ('created'|'captured'|'failed'|'refunded'),
purpose ('single_class' | 'cohort' | 'subscription'),
related_id,                            -- class_id / cohort_id / subscription_id
created_at
```

### recordings
```
id, class_id (FK),
storage_url,                           -- your R2/S3 object, NOT the raw Zoom URL
duration_sec, size_bytes,
status ('processing' | 'ready'),
available_from,                        -- gate replay until you've reviewed it
created_at
```

### attendance (optional, phase 3)
```
id, class_id, user_id, joined_at, left_at
```

---

## 3. Zoom integration (interactive, Meeting SDK)

### Scheduling a class (admin action)
1. You create a class in the admin panel.
2. Backend calls Zoom **API** `POST /users/me/meetings` → stores `zoom_meeting_id`, `join_url`, `password`.
3. Enable cloud recording on the meeting at creation (`settings.auto_recording = "cloud"`).

### Joining a class (student action)
1. Student clicks **Join** → frontend hits `POST /classes/{id}/join`.
2. Backend runs `can_access()`. If false → 403 + upsell.
3. If true → backend generates a **Meeting SDK signature** (short-lived JWT signed with your SDK key/secret) and returns `{ signature, sdkKey, meetingNumber, password, userName }`.
4. Frontend mounts the Zoom Meeting SDK component **inside your page** — students get full interactivity (unmute, raise hand, chat, screen share) without leaving your site.

```python
# FastAPI — signature endpoint (sketch)
import time, jwt
def meeting_sdk_signature(meeting_number: str, role: int = 0):
    iat = int(time.time()) - 30
    exp = iat + 60 * 60 * 2          # 2h class
    payload = {
        "appKey": SDK_KEY, "sdkKey": SDK_KEY,
        "mn": meeting_number, "role": role,   # 0 = attendee, 1 = host
        "iat": iat, "exp": exp, "tokenExp": exp,
    }
    return jwt.encode(payload, SDK_SECRET, algorithm="HS256")
```

### After class → recordings
1. Zoom fires `recording.completed` webhook to your backend.
2. **Verify the webhook signature** (`x-zm-signature` HMAC) before trusting it.
3. Download the recording file, upload to your own storage (Cloudflare R2 / S3), create a `recordings` row with `status='processing'`.
4. You flip `available_from` after a quick review → it appears in the gated library.

> **Why re-host instead of linking Zoom's URL:** keeps your Zoom storage bill flat (~$100/mo per TB on Zoom vs R2 at a fraction), and lets you serve **signed, short-expiry URLs** so recordings can't be freely shared.

### Reliability hedge
Ship the **API + deep-link** version first (auto-create gated meeting, deep-link students into the real Zoom client). It's bulletproof. Swap in the embedded Meeting SDK in Phase 3 once payments + recordings are proven. The web embed is occasionally flaky on screen-share/breakouts — don't let it block revenue validation.

---

## 4. Razorpay integration (three flows, one verification discipline)

**Every** flow ends the same way: verify signature server-side → write `payments` row → write `entitlements` row. Never grant access from the frontend callback alone.

### Flow A — Pay-per-class & Cohort (one-time, Orders API)
```
create order (server) → Razorpay Checkout (client) → payment
→ webhook `payment.captured` → verify HMAC signature
→ payments.status = 'captured'
→ entitlement:
     pay-per-class → scope_type='class',  scope_id=class_id,  valid_until=NULL
     cohort        → scope_type='cohort', scope_id=cohort_id, valid_until=cohort.end_date
→ if cohort: cohorts.seats_taken += 1 (reject at seat_limit)
```

### Flow B — Subscription (monthly, Subscriptions API)
```
create plan ONCE (razorpay_plan_id) → create subscription per user
→ UPI AutoPay / card mandate (student authorises)
→ webhook `subscription.charged` (every cycle):
     upsert entitlement scope_type='all_access', valid_until = current_period_end
→ webhook `subscription.halted` / `subscription.cancelled`:
     stop renewing; entitlement lapses naturally at valid_until
```
Effective cost: ~2% + 18% GST + ~0.99% recurring fee. Plan margins around ~2.36%–3.4% per rupee collected.

### Flow C — Free grant
No Razorpay. On signup (or first free-class join), write `entitlement(scope_type='class', source='free_grant')` for whichever classes are flagged free — or just rely on `access_type='free'` short-circuit in `can_access()`. (Simpler: use the flag, skip the row.)

> You did SC3010, so: webhook signature verification is non-negotiable on all three, and treat the Razorpay webhook as the **source of truth**, not the browser redirect (browsers lie / drop / get replayed).

---

## 5. Pages

### Student-facing (Next.js)
- **Landing page** — YouTube-funnel optimised; hero CTA = "Watch a free class." Social proof from the 101K channel.
- **Auth** — signup / login (email + phone OTP recommended for the India market).
- **Schedule / catalog** — upcoming + past classes, with `Free` / `Paid` / `Cohort` badges and a countdown to next live.
- **Cohort page** — syllabus, dates, seats left, early-bird price + deadline → enroll.
- **Subscription page** — what monthly unlocks → subscribe.
- **Class room** — the Zoom embed (or deep-link button), live only when `status='live'`.
- **Recordings library** — gated by entitlement; signed URLs.
- **Account / billing** — active sub, enrollments, purchase history, manage subscription.

### Admin (just you)
- Schedule class / create cohort / create plan
- Recording review + publish (`available_from`)
- Dashboard: revenue by source, enrollments, active subs, attendance, free→paid conversion

---

## 6. Build sequence (validate revenue early, polish later)

**Phase 0 — Skeleton + free classes (validate teaching loop)**
Auth · class schedule · Zoom API auto-create · deep-link join · free classes only. No payments. Prove students show up and the live experience works.

**Phase 1 — One-time payments (first revenue)**
Razorpay Orders · entitlements table · pay-per-class + cohort enrollment · gated recordings (R2 + signed URLs) · recording webhook.

**Phase 2 — Subscriptions (recurring revenue)**
Razorpay Subscriptions + UPI AutoPay · `all_access` entitlements · billing page · churn/halt handling.

**Phase 3 — Embedded experience + insight**
Swap deep-link → embedded Meeting SDK · attendance tracking · admin analytics dashboard.

**Phase 4 — Funnel polish**
Landing-page conversion, free→paid nudges, email/WhatsApp reminders for upcoming live classes, referral.

---

## 7. Recurring cost (small scale, ≤100–300 students)

| Item | Cost / month |
|---|---|
| Zoom Pro (~100 attendees) or Business (~300) | ₹1,100 – ₹1,500 |
| Hosting — Vercel + FastAPI (Railway/Render) | ₹1,500 – ₹3,500 |
| Postgres (Neon / Supabase) | ₹0 – ₹2,000 |
| Recording storage (Cloudflare R2) | ₹100 – ₹1,000 |
| Transactional email/OTP | ₹0 – ₹500 |
| Domain (amortised) | ~₹100 |
| **Fixed total** | **≈ ₹3,000 – ₹8,000** |
| Razorpay | ~2.36% of revenue (≈3.4% on subs) |

All-in under ₹10k/month until real scale. The only line that grows materially is storage, and that's slow.

---

## 8. Open decisions (your call — defaults proposed)

1. **Auth provider** — own JWT in FastAPI (max control) vs Clerk/Supabase Auth (faster). *Default: Supabase Auth for phone OTP out-of-the-box.*
2. **What the subscription unlocks** — all live classes only, or live + full recordings archive? *Default: live + recordings (stickier).*
3. **Recording host** — Cloudflare R2 (cheap, yours) vs YouTube unlisted (free, but leak-prone). *Default: R2 with signed URLs.*
4. **Free preview gating** — fully open (no login) for max funnel, or login-required (captures email)? *Default: login-required — you want the email for the funnel.*
5. **Cohort seat caps & refund policy** — ✅ **DECIDED (2026-05-31)**: default seat cap **50** per cohort (admin can override per-cohort). Refund policy: **full refund within 7 days of purchase AND before the 2nd live session**, otherwise no refund.
6. **Participant ceiling** — ✅ **DECIDED (2026-05-31)**: **≤300 (Zoom Business)** — taking the headroom now rather than upgrading later.

### Phase 1 build decisions (2026-05-31)
- **First payment flow**: cohort enrollment (one-time Razorpay Order, with the early-bird pricing already modelled on the `cohorts` table). Pay-per-class comes after, reusing the same Orders + entitlements core.
- Seat-cap enforcement: block enrollment once `seats_taken >= seat_limit` (when a cap is set).
- Refund handling is policy/manual for now — no automated refund flow in Phase 1; the policy line above governs.

---

## 9. Risks to watch

- **Meeting SDK web embed** flakiness → mitigated by shipping deep-link first.
- **UPI AutoPay mandate friction** — Indian recurring mandates have setup drop-off; keep a one-time monthly-pass fallback.
- **Recording leakage** — signed URLs, short expiry, watermark with student email if it becomes a problem.
- **Free-tier link sharing** — login-gate free classes; one active session per account.
- **Zoom participant cap** — interactivity naturally caps class size, so this rarely bites, but know the ceiling per plan.
