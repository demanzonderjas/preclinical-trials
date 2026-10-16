# Testing

Two layers. The backend layer guards behaviour across the Laravel 13 port and covers every
A2 page (`tests/Feature/Frontend`, `Workspace`, `Admin`). The end-to-end layer drives the A2
pages in a browser (38 journeys at the end of phase 5; phase 7 extends it).

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

Playwright starts the app on port 8000 with `APP_ENV=e2e`, or reuses a running one. About 2–3 s per test.
