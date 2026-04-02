# Game of Meditation — MVP Definition v1.0
**Date:** April 2026
**Status:** Active
**Based on:** PRD v1.0 + Team Product Audit

---

## 🎯 MVP Goal

Ship a working, delightful, globally-accessible meditation app that proves the core loop:

> **Open app → Meditate → Feel progress → Come back tomorrow.**

Everything else is Phase 2+.

---

## ✅ MVP Feature Boundary

### IN SCOPE (Build Now)

| Feature | Status | Notes |
|---|---|---|
| Onboarding (5-step) | ✅ Built | Welcome, Name, Language, First Breath, Ready |
| Meditation Timer | ✅ Built | Free + presets, breathing animation |
| Session Completion | ✅ Built | MSS delta, duration, animated card |
| Session History | ✅ Built | Grouped by date, local storage |
| Streak Tracking | ✅ Built | Day streak, local |
| Buddha Level Progression | ✅ Built | 9 levels, progress bar |
| Mind Stability Score (simple) | ✅ Built | Time-based only — NO biometrics in MVP |
| Session Type Tags | ✅ Built | 9 traditions (Vipassana, Metta, etc.) |
| Experience/Feedback Center | ✅ Built | Mood, tags, free-text |
| Activity Heatmap | ✅ Built | 12-week GitHub-style grid |
| Profile Screen | ✅ Built | Name, language, stats, Buddha level |
| Daily Reminders | ✅ Built | Local push notifications |
| Settings | ✅ Built | Reminder time, sign out, dev reset |
| Auth (Email) | ✅ Built | Sign up, sign in, sign out |
| Cloud Session Sync | ✅ Built | On sign-in, upsert to Supabase |
| Guided Sessions (player) | ✅ Built | Audio player, 3 placeholders |
| Basic Clubs | ✅ Built | List, join/leave, search |
| **21-Day Program** | ❌ Not built | Phase 1 priority — next sprint |
| **Teacher Dashboard (basic)** | ❌ Not built | Phase 2 |

### OUT OF SCOPE FOR MVP (Phase 3+)

| Feature | Reason |
|---|---|
| HRV / EEG / Biometric MSS | Hardware dependency, scientific validation needed |
| AI personal mantra generation | Complex, not core loop |
| Real-world retreat marketplace | Enterprise-scale |
| Sponsorship system | Revenue complexity |
| Global competitions | Needs large user base first |
| Volunteer/certification pipeline | Phase 3 |
| Institutional programs | Phase 3 |
| Wearable integration | Phase 3 |

---

## 🌍 MVP Language Strategy

**Launch with 3 languages only:**

| Code | Language | Reason |
|---|---|---|
| `en` | English | Global default |
| `hi` | Hindi | Core market (India) |
| `es` | Spanish | Largest Spanish-speaking audience |

All 9 languages are built in the codebase but **only en/hi/es are validated for Day One**. Others ship as-is (best effort) with community translation later.

---

## 📊 MVP Success Metrics

| Metric | Target (30 days post-launch) |
|---|---|
| Day 7 retention | > 30% |
| Avg session duration | > 5 minutes |
| Session completion rate | > 70% |
| Daily active users | 500+ |
| Streak (avg) | > 3 days |
| Feedback submission rate | > 20% of sessions |

---

## 🗺️ Realistic Roadmap

### Phase 1 — MVP (Now → Month 4)
**What we're building:**
- ✅ All items above marked "Built"
- ❌ 21-Day Program / Challenge (next sprint)
- App Store submission (iOS + Android)
- Supabase production setup
- Basic content: 10 guided sessions

### Phase 2 — Beta (Month 4–8)
- Teacher Dashboard (upload content, manage students)
- Course/Program delivery (21-day challenges, structured paths)
- Community feeds within Clubs
- Donations / tip jar for teachers
- 3 more languages (fr, ar, pt)
- Performance hardening

### Phase 3 — Growth (Month 8–18)
- Clubs competitions + leaderboards
- Retreat discovery
- Certifications / Train the Trainer pipeline
- Remaining languages (zh, ja, sw)
- Biometric foundation (HealthKit/Health Connect)

### Phase 4 — Advanced (18+ months)
- HRV / EEG integration
- AI-personalized meditation paths
- Global live sessions / satsangs
- Institutional licensing

---

## ⚙️ Technical Constraints (MVP)

| Constraint | Target |
|---|---|
| Cold start time | < 3 seconds |
| Timer accuracy | ± 1 second |
| Offline support | Timer + history fully offline |
| Audio guided sessions | Stream-first, no large local bundles |
| Supabase free tier limits | 500 MB DB, 5 GB storage — sufficient for MVP |
| Max concurrent users | 1,000 (Supabase free tier) |
| Platforms | Android + iOS |

---

## 🔐 Content Licensing Policy

All wisdom quotes and content must be:
- **Public domain** (pre-1928 authors: Buddha, Rumi, Lao Tzu, etc.) OR
- **Original content** created by Game of Meditation team OR
- **CC0 / CC-BY licensed** with attribution

No copyrighted content without explicit written permission.

---

## ⚠️ Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Supabase free tier exceeded | Medium | High | Self-host when > 1k users |
| Expo Go dropped for SDK 53 | High | Medium | Build dev client before SDK 53 |
| Audio content licensing violation | Low | High | CC0/public domain policy enforced |
| Low Day 7 retention | Medium | High | 21-day program + daily reminders |
| Android background timer killed | Medium | Medium | Use foreground service for timer |
| Push notifications removed from Expo Go SDK 53 | High | Medium | Dev build before SDK 53 |

---

## 🧱 Database Schema
Already defined in `supabase/migrations/0001_initial_schema.sql`:
- `profiles` — user identity, language, Buddha level, MSS
- `sessions` — meditation sessions with duration, MSS delta, status
- `clubs` — community groups
- `club_members` — membership with roles

**Next migration needed:**
- `programs` table (21-day challenges)
- `program_enrollments` table
- `guided_content` table (teacher-uploaded audio)

---

## 🎯 Single Most Important Next Action

**Build the 21-Day Program feature.**

This is the highest-leverage MVP gap:
- Drives Day 7+ retention
- Enables teacher use case
- Differentiates from every other timer app
- Directly supports the user's 21-day workshop model
