# Testing

Two layers. The backend layer is the safety net for the Laravel 13 port, phase 1. The
end-to-end layer is parked until the A2 pages exist (phases 3–5).

## 1. Backend tests (PHPUnit)

`tests/Feature/Characterization/*` pins down how the platform behaves today: the protocol lifecycle,
visibility, embargo, messaging, admin access, content and the external API contract. The
same tests must pass after the port.

- **Database:** MySQL database `pct_testing`. Create it once with
  `CREATE DATABASE pct_testing`. Credentials come from your `.env`; `phpunit.xml` only
  overrides the database name.
- **Run (Laravel 8 needs PHP 7.4, from Herd):**

  ```bash
  "$HOME/Library/Application Support/Herd/bin/php74" -d pcre.jit=0 vendor/bin/phpunit --exclude-group pending-fix
  ```

  After the port it is simply `php artisan test`.
- **Groups:**
  - `pending-fix`: the *secure or correct* behaviour for bugs we fix in phase 1. These
    fail on the current app on purpose; after phase 1 they must pass, and the group
    label is removed.
  - `known-bug`: pins a current bug in the baseline run. When phase 1 fixes the bug,
    the test is deleted or inverted.
- **Run time:** about 3.5 seconds for 200+ tests.

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
PCT_PHP="$HOME/Library/Application Support/Herd/bin/php74" npx playwright test
```

Playwright starts the app on port 8000 with `APP_ENV=e2e`, or reuses a running one. About 2–3 s per test.
