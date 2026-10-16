# Testing

Two layers. The backend layer guards behaviour across the Laravel 13 port. The end-to-end
layer drives the real SPA in a browser. It passed on the Laravel 13 backend (23 passed, 2
parked) and gets its page helpers rewritten as the A2 pages land (phases 3–5).

## 1. Backend tests (PHPUnit)

`tests/Feature/Characterization/*` pins down how the platform behaves today: the protocol lifecycle,
visibility, embargo, messaging, admin access, content and the external API contract. The
same tests must pass after the port.

- **Database:** MySQL database `pct_testing`. Create it once with
  `CREATE DATABASE pct_testing`. Credentials come from your `.env`; `phpunit.xml` only
  overrides the database name.
- **Run:** `php artisan test` (PHP 8.4).
- **Bugs fixed in phase 1:** the bugs the phase 0 run documented (the `pending-fix` and
  `known-bug` groups) were fixed in the Laravel 13 port. Their tests now describe the
  fixed behaviour, and the groups are gone.
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

What changes per redesigned page is only its helper in `tests/e2e/support/ui/*.ts`, which
currently targets the legacy markup. The plan is to rewrite each helper against the A2 page
when that page is built, with `getByRole`/`getByLabel`, and to add specs for the new features.

**Run:**

```bash
cd tests/e2e && npm install && npx playwright install chromium
npx playwright test
```

Playwright starts the app on port 8000 with `APP_ENV=e2e`, or reuses a running one. About 2–3 s per test.
