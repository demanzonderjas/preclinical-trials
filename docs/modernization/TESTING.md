# Testing

Two layers. The backend layer guards behaviour across the Laravel 13 port and covers every
A2 page (`tests/Feature/Frontend`, `Workspace`, `Admin`). The end-to-end layer drives the A2
pages in a browser: 59 journeys (phase 7), of which 4 run again at phone size.

## 1. Backend tests (PHPUnit)

`tests/Feature/Characterization/*` pinned down the legacy behaviour for the Laravel 13 port.
What remains after the cutover: the external API contract, the scheduled embargo and end-date
commands, mail rendering and admin access (every `/admin` route, read from the router). The
behaviour of the former JSON API is tested through the A2 pages in `tests/Feature/Frontend`,
`Workspace` and `Admin`.

- **Database:** MySQL database `pct_testing`. Create it once with
  `CREATE DATABASE pct_testing`. Credentials come from your `.env`; `phpunit.xml` only
  overrides the database name.
- **Run:** `php artisan test` (PHP 8.4).
- **Bugs fixed in phase 1:** the bugs the phase 0 run documented (the `pending-fix` and
  `known-bug` groups) were fixed in the Laravel 13 port. Their tests now describe the
  fixed behaviour, and the groups are gone.
- **JavaScript unit tests:** `npm run test:js` (Node's built-in runner, no extra packages)
  checks the answer helpers in `lib/rich-text.ts`: pasted text, legacy HTML, unsafe markup.
  Paste cleanup that needs a browser DOM is covered by the e2e suite.
- `MailRenderingTest` renders and sends every mail for real, because the other tests fake the mailer.
- **Run time:** about 6 seconds for 217 tests.

## 2. End-to-end user-action tests (Playwright), parked

`tests/e2e` drives a real browser through user actions. The parts that last:

- `.env.e2e`, `App\Providers\E2EServiceProvider` and `routes/e2e.php`. These are only active
  when `APP_ENV=e2e`. They provide:
  - its own database, `pct_e2e`;
  - mails recorded to `storage/app/e2e/mails.jsonl` instead of sent;
  - `/__e2e/*` helpers: reset (about 0.15 s from a snapshot), log in as a test user, read
    mails, freeze the clock, run `embargo:check`, look up protocol state.
- `database/seeders/E2ESeeder.php`: 4 test users (admin, researcher, colleague, unverified)
  and protocols in every status. They are named in `tests/e2e/support/fixtures-data.ts`.
- `tests/e2e/specs/*`: user journeys written as actions (`workspace.submitForPublication(...)`,
  `admin.approve(...)`).

Page helpers live in `tests/e2e/support/ui/*.ts` and find elements by role and label
(`getByRole`/`getByLabel`), so markup changes rarely break the specs.

**Run:**

```bash
cd tests/e2e && npm install && npx playwright install chromium
npx playwright test
```

**When to run it.** The full suite takes a few minutes, so it is not part of every change:

- **Every change:** `php artisan test` and `npm run build` (plus `npm run test:js` when
  `lib/rich-text.ts` changes).
- **A change to one area:** only the specs for that area, e.g.
  `npx playwright test specs/messages.spec.ts specs/protocols.spec.ts`.
- **The full suite:** after big changes (a new flow, a change across several areas, shared
  layout or form components, routing or middleware) and before merging or deploying.

The e2e app always uses the production build (`npm run build` first), also while
`npm run dev` runs: on-demand dev modules are slow enough to time tests out. If port 8000
is taken (for example by `php artisan serve`), run on another one:
`PCT_E2E_PORT=8031 npx playwright test`.

Playwright starts the app on port 8000 with `APP_ENV=e2e`, or reuses a running one. About 2–3 s per test.

## Journeys (phase 7)

| Spec | Who | What |
|---|---|---|
| `public.spec.ts` | guests | home figures, database search and facets, CSV export (logged in), protocol access, news, help (audiences, search, vote), contact form, ambassadors, the error page |
| `auth.spec.ts` | guests | register and verify, log in and out, wrong password, password reset |
| `workspace.spec.ts`, `protocols.spec.ts` | researchers | dashboard, new draft, autosave across a reload, submit lock, import from PRIS, submit, feedback and resubmit, amend (stays public until approved; admin approves or returns it), delete, duplicate, link, PDFs |
| `messages.spec.ts` | researchers | ask an author, reply, comments to the PCT team, attachments, archive, mark unread, notifications |
| `embargo.spec.ts` | both | request, approve, reject, set a new end date |
| `profile.spec.ts` | researchers | details, password change |
| `admin.spec.ts` | PCT team | review and decide (in `protocols.spec.ts`), users (verify, reset link, temporary password), news, FAQ order, pages, ambassadors, statistics export |
| `mobile.spec.ts` (`@mobile`) | all | menu and filter sheet, log in and form steps, messages one pane at a time, the More menu |

`npx playwright test --project=desktop` or `--project=mobile` runs one of the two.
