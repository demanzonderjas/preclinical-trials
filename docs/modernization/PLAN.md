# PCT modernization plan

Status: phase 0 and phase 1 done · branch `modernization` · last updated 16 Oct 2026

- **Phase 0 (16 Oct):** characterization tests and end-to-end infrastructure. See [TESTING.md](TESTING.md).
- **Phase 1 (16 Oct):** Laravel 13.37 on PHP 8.4, with the security and bug fixes from section 7. The old SPA runs unchanged on it and can be deployed now; see [DEPLOY.md](DEPLOY.md).

## 1. What we are building

- **Contract:** Quote Option B, "Full modernization" (21 Aug 2026, Julia Menon). Covers a security and backend upgrade, frontend modernization and a visual redesign. That quote excludes new features. **Decision of 16 Oct 2026: the new features shown in A2 are included** (section 3c). ORCID was dropped the same day.
- **Design:** direction **A2 · Clear Lens, muted** in the Claude Design project "PCT Redesign Directions" (https://claude.ai/artifact/VmdpEK6jf5fJWUb9oqchgS, page "A2"). It has 22 artboards: 8 public, 3 auth, 6 researcher workspace, 6 admin, plus 1 brand board. Rounds A, D and D2 are rejected alternatives; ignore them.
- **Target stack:** PHP 8.4, Laravel 13, Inertia.js 2 + React 19 + TypeScript, Vite, Tailwind CSS 4, Node 24 LTS. Same repository and same MySQL database. No data migration, only additive schema changes.

## 2. Decisions taken

| # | Decision | Why |
|---|----------|-----|
| D1 | Upgrade the backend first, then build the frontend in the new design. | Avoids building the new UI on tooling we are about to remove, and keeps backend regressions separate from design changes. |
| D2 | Stay in this repo on a long-lived branch. Port the code into a fresh Laravel 13 skeleton instead of five sequential major upgrades. | Keeps 700+ commits of history and the production DB. The app is small (111 PHP files in `app/`). |
| D3 | Keep React, but replace the SPA plumbing (React Router, `resources/js/queries`, the server-data MobX stores) with Inertia. Use SSR for the public pages. | Today every URL serves an empty shell with one `<title>`. Public pages need real HTML and per-page metadata, and Inertia removes duplicated routing and fetch code. |
| D4 | Keep two external JSON endpoints byte-compatible: `POST /api/iles/protocol` and `GET /api/external/viewable-protocols`. | ILES and an external consumer depend on them, including the HTTP-200 + `success:false` error shape. Characterization tests are written before porting. |
| D5 | Rebuild pages directly in A2. Do not port old components first. | Every page's markup changes anyway. |
| D6 | All A2 features are in scope, including the new ones in 3c. (16 Oct) | Client and owner decision |
| D7 | **Protocol detail pages stay login-only**, as today. The database search listing stays public. A logged-out visitor who opens a protocol gets a log-in prompt that returns them to the protocol. (16 Oct) | Owner decision |
| D8 | We design mobile and tablet layouts ourselves using the rules in section 6. The client reviews them on staging. (16 Oct) | A2 has desktop artboards only. |

## 3. Scope: the design compared with what exists

### 3a. Existing features, restyled to A2

Same behaviour, new look.

- **Public:** Home, Database search, Protocol detail with revision history (login required, see D7), About (merges the team, advisory board, ambassadors map and background pages), Help/FAQ, News list and item, Contact, Disclaimer and the other CMS pages.
- **Auth:** Log in, Create account, Reset password, Verify email.
- **Researcher:** Dashboard, My protocols, Protocol form, Messages and "Ask question to author", Profile and change password.
  - Protocol form: same fields and sections, image upload, PRIS/APAFiS import, submit/resubmit, amendment with reason.
  - My protocols: edit, view, duplicate, link, delete draft, create amendment, extend embargo.
  - Messages: notification toggle and block.
- **Admin:** Protocols list, Approve/Reject, Embargo extensions (approve, reject, set a different date), Content (News, FAQ, Pages, Ambassadors), Users list with password reset, Statistics.
- **Server-side additions needed to render A2 with existing data:**
  - registration counts per year, species, study stage and country;
  - an "upcoming embargo expiries" table with reminder state;
  - a "recently decided" extensions table;
  - the import log table;
  - per-status counts.

### 3b. Small adaptations (agreed)

- **Server-side search, filtering, facet counts, sorting and pagination.** Replaces loading every protocol into the browser.
- **"Registered before start".** Derived from the registration date and `start_date`. Used as a badge, a filter and in the statistics.
- **Cite this protocol**, with a copy button.
- **Charts** on Home and admin Statistics.
- **Contact form:** "Topic" and "Related PCT ID" fields.
- **News:** a category field and filter.
- **Revision view "Show changes only"**, with inline diffs.
- **Protocol form as a 7-step stepper** with a completeness percentage.

### 3c. New features (agreed 16 Oct, in scope)

| # | Feature (artboards) | Notes |
|---|---|---|
| F1 | **Per-field reviewer feedback** (AdminReview, Feedback, Manage, Dashboard) | Admin attaches points to fields. Points have states open, addressed or resolved, and each has a reply thread. Resubmit unlocks when every point is addressed. Review rounds history and an internal note. Replaces the single reject message; old reject messages are shown as round 1. |
| F2 | **Researcher ↔ PCT team comments per record**; admins take part in Messages (Manage, Messages, AdminReview) | New "team" channel type next to the existing researcher-to-researcher channels |
| ~~F3~~ | ~~ORCID sign-up, log-in, link and unlink~~ | **Dropped (16 Oct).** Leave out the ORCID buttons on Login and Register. The Profile section "Name & ORCID iD" becomes "Name on protocols", which keeps only the publish-name toggle (F11). |
| F4 | **Registration certificate PDF** and **protocol PDF** (Dashboard, Manage, Protocol) | Server-rendered PDF, time-stamped |
| F5 | **Autosave** of drafts (Create) | Debounced save, with a "saved at" indicator |
| F6 | **Activity feed / audit trail** and a "needs your action" list (Dashboard) | Built from an `activity_log` table written at each lifecycle event |
| F7 | **Help centre by audience** (researcher, ethics committee, editor, funder, public), "Helpful?" votes, FAQ "Shown to" (Help, AdminContent) | New FAQ fields plus a votes table |
| F8 | **Admin user management**: manual email verify, temporary password, deactivate, user detail panel, filters (AdminUsers) | Deactivated users cannot log in; their protocols stay |
| F9 | **Exports**: protocols CSV (Database, Stats), users CSV, statistics PDF (AdminStats) | |
| F10 | **Messages:** archive, mark unread, attach file, insert protocol link, filters (Messages) | |
| F11 | **Profile:** "publish my name by default"; per-protocol "publish my name"; "log out on all devices"; avatar initials (Profile, Create) | Session-based logout of other devices |
| F12 | **Report an issue with this record** and a **PubMed ID** field (Protocol) | The report goes to Contact with the PCT ID prefilled |
| F13 | **Password rule:** 12+ characters with a strength meter (Register, Profile) | Existing users are not forced to change |

### 3d. Client choices still open

These do not block the build. Placeholders are used until the client answers.

1. The "Book a 1:1 appointment" link and the walk-through video URL (today a YouTube embed).
2. Newsletter: keep Laposta, but post to it from the new styled form.
3. Brand board: the logo and loader from A2_Brand become the site logo, favicon and loading state. This needs SVG sign-off.

## 4. Phases

| Phase | Work | Exit criteria |
|---|---|---|
| **0 · Safety net** | A test database. Characterization tests for: protocol lifecycle (draft → submit → approve/reject → amend), embargo (request, approve, auto-lift, reminders), messaging access, both external endpoints, admin guards, search visibility (published, non-embargoed, contact details hidden). | Green on the current Laravel 8 app |
| **1 · Backend upgrade** | Fresh Laravel 13 skeleton; port models, migrations, controllers, mail, commands and the scheduler. `env()` → `config()`. Replace fruitcake/cors, facade/ignition, Sanctum 2. Upgrade maatwebsite/excel; replace or upgrade orhanerday/open-ai. Security fixes (section 7). | The same tests are green on Laravel 13; external contract tests pass. |
| **2 · Design system** | Vite, Tailwind 4 theme from A2 tokens (section 5), Inertia + SSR. Public, workspace and admin layouts with responsive headers. Component kit. | A component preview page matches the A2 Brand board at 1440 and 390 px |
| **3 · Public site** | Home, Database, Protocol, About, Help, News, Contact, CMS pages, auth pages, plus 3b items. F7 (help by audience), F12 (report issue, PubMed ID) and F13 (password rule). | Each page passes the page checklist (section 6) |
| **4 · Researcher workspace** | Dashboard, My protocols, Protocol form (stepper), Messages, Profile, Import. F1 (researcher side), F2, F4, F5, F6, F10 and F11. | Checklist, plus a full lifecycle walk-through by hand |
| **5 · Admin** | Protocols, Review, Embargoes, Content, Users, Statistics. F1 (admin side), F8 and F9. | Checklist |
| **6 · Cutover** | Remove the old SPA, Mix and unused packages. Staging deploy, client acceptance, production deploy with DB backup, smoke tests, rollback plan. | Client sign-off, production live |

F1 is split across phases 4 and 5, but its data model and backend are built once, at the start of phase 4.

## 5. Design tokens (taken from the A2 files)

The artboards use inline styles: about 25 font sizes including half pixels, and about 12 radii. These are normalized to a scale. We implement the system, not every literal value.

- **Colour**
  - ink `#323742`, ink-muted `#585F6F`, ink-subtle `#798399`
  - line `#D2D6DD`, line-strong `#A5ACBB`
  - surface `#FFFFFF`, surface-tint `#F3F7F8`, teal-50 `#E6F0F1`
  - teal-200 `#B5D1D6`, teal-300 `#83B2BA`, teal-500 `#558F99`
  - link/focus `#2C6FAA` (hover `#163755`), focus-ring `#BDD7EE`
  - peach-100 `#FFE2D7`, peach-300 `#FFA888`, rust (error/emphasis) `#9C2A00`
  - These match the "PCT Colour palette 2026" sheet. The bright `#FF3E38` is not used in A2.
- **Type:** Manrope 700/800 for headings, buttons and eyebrows; Source Sans 3 400/600/700 for body text. Scale: 12.5 · 14 · 15 · 16 · 17 · 19 · 22 · 28 · 34 · 44 · 56.
- **Radius:** 6 (chips), 10–14 (inputs and small cards), 20–24 (cards), 28–32 (panels), pill `999px`.
- **Elevation:** a resting card has a 1px inset line. A raised card uses `0 16px 36px -20px rgba(50,55,66,.35)`.
- **Focus:** `3px solid #2C6FAA`, offset 2px, on every interactive element.
- **Layout:** content width 1160–1344 px, gutter 48 px at desktop. The logged-in header is 72 + 56 px (top bar + tab row).

## 6. Guardrails: how we keep it on direction

**Page checklist.** Every page passes this before it counts as done:

1. **Side-by-side check at 1440 px** against its A2 artboard: layout, spacing, type and colours, from screenshots. Deviations are listed in the PR.
2. **Real data, real states.** Empty, long-text, error and loading states, plus embargoed and draft records. A2 shows the happy path only.
3. **Responsive** at 1024, 768 and 390 px, following the mobile rules below.
4. **Accessibility.** Keyboard path, visible focus, labels, AA contrast, headings in order.
5. **Parity.** Every action the old page had still exists.
6. **Scope.** Only what sections 3a–3c list. Anything else the artboard implies goes to the open list in section 8 first.

**Mobile rules (D8).** Breakpoints are `lg` 1024 and `md` 768. Base styles are mobile-first.

- **Header**
  - Public: below `lg`, the logo, a "Log in" link and a menu button that opens a full-height sheet with the nav and the "Create account" button.
  - Workspace and admin: the top bar keeps the logo, a "New protocol" icon button and the avatar menu. The tab row becomes a horizontally scrollable tab strip.
- **Page layout**
  - Grids collapse to one column below `md`; 3- and 4-up card grids go to 2-up between `md` and `lg`.
  - Side rails (database filters, the "on this page" aside, the form's completeness rail, feedback summary): below `lg` they become a sticky bottom bar (summary plus primary action) or a "Filters" / "Sections" button that opens a sheet.
  - Tables become stacked cards below `md`. Each card shows the primary column as a title, the other columns as label/value rows, and the actions in a footer.
  - Two-pane views (Messages, admin Users): below `lg`, list and detail become separate screens with a back link.
- **Content and typography**
  - Hero and h1 sizes drop one step per breakpoint (56 → 44 → 34).
  - Body text stays at least 16 px. Tap targets are at least 44 px.
  - Long PCT IDs and titles wrap; nothing scrolls horizontally except data tables that are explicitly marked as scrollable.
  - Charts: the bars-per-year chart scrolls horizontally inside its card; the other charts stack.
- **Forms:** one column, with the step action bar fixed at the bottom of the viewport.

**Review rhythm.**
- One PR per page group.
- The client sees staging at the end of phases 3, 4 and 5.
- Hours are tracked per phase.

## 7. Security findings to fix in phase 1

- `POST /api/translate` is public and calls OpenAI with the server key. → Require auth and verified email, and add rate limiting.
- `POST /api/channel/id` takes `questioner_id` from the request body. → Use the authenticated user.
- `protocols/mine`, `protocols/mine-published`, `channels/mine` and `GET /api/user` have no auth middleware. → Add `auth`.
- `env()` is read outside config: `ILES_TOKEN`, `EXTERNAL_API_KEY`, `ADMIN_MAIL`, `OPENAI_API_KEY`. → Move to config.
- ILES error responses include the serialized exception. → Log it instead of returning it.
- Admin "change any user's password by email" is replaced by F8 (reset link or temporary password) and logged as an AdminAction.
- Check `APP_DEBUG` and the production error pages.
- **The owner check can be bypassed (IDOR).** `EnsureUserIsOwner` reads `$request->protocol_id`, where body or query input wins over the route parameter, so `DELETE /api/protocol/{victim}?protocol_id={own}` deletes someone else's draft. `duplicate` is affected the same way. → Read the route parameter and use policies.
- **The contact form throttles at 5 per minute instead of 10.** The `api` group throttle and `throttle:10,1` share one counter. The frontend also shows "We will contact you" when the request was refused. → Use a single limiter, and show the error.
- **Smaller bugs pinned in the tests (`known-bug` group):**
  - rejecting an embargo extension without a message gives a 500;
  - end-date reminders also go to drafts and rejected protocols;
  - the news `publish_date` is ignored, and drafts are readable by id;
  - the public FAQ includes drafts;
  - an unknown page slug gives a 500;
  - the admin password reset returns an empty response;
  - the ambassador name is read from `contact_name`.

All of these have tests: `pending-fix` for the secure behaviour, `known-bug` for the current behaviour. See [TESTING.md](TESTING.md).

## 8. Open items

- Section 3d placeholders: booking link, video URL, newsletter, logo sign-off.
