# Deploying the Laravel 13 backend (phase 1)

Phase 1 can go live on its own: the existing React SPA runs unchanged on the new
backend, which the end-to-end suite confirms. That gets the security fixes into
production before the redesign.

## Server

- **PHP 8.4** with the usual Laravel extensions: `pdo_mysql`, `mbstring`, `openssl`, `ctype`, `fileinfo`, `tokenizer`, `xml`, `curl`. Also `gd` and `zip` for maatwebsite/excel.
- **Composer 2.**
- **Web server document root:** `public/`, as before. `server.php` no longer exists; nothing should point at it.
- **Scheduler:** unchanged, `* * * * * php artisan schedule:run`. It still runs `embargo:check` and `enddate:reminder` daily at 00:00.

## `.env` changes

| Key | Action |
|---|---|
| `MAIL_FROM_ADDRESS` | **Must be a real address.** `null` worked on SwiftMailer; Symfony Mailer refuses to send without it. |
| `ADMIN_MAIL`, `ILES_TOKEN`, `EXTERNAL_API_KEY`, `OPENAI_API_KEY` | Unchanged. They are now read through `config/pct.php` and `config/services.php`, so `config:cache` is safe. |
| `OPENAI_MODEL` | New, optional (default `gpt-4o-mini`). The old code was hard-wired to `gpt-3.5-turbo`, which OpenAI has retired. |
| `CACHE_DRIVER`, `FILESYSTEM_DRIVER` | Still read as fallbacks. The new names are `CACHE_STORE` and `FILESYSTEM_DISK`. |
| `MAIL_ENCRYPTION` | No longer used. TLS is negotiated automatically; for port 465, set `MAIL_SCHEME=smtps`. |
| `BROADCAST_DRIVER`, `PUSHER_*`, `MIX_PUSHER_*` | Unused, can be removed. |

Defaults match the Laravel 8 site: file cache, file sessions, sync queue, MySQL. No new
tables are needed. The `password_resets` table keeps its name (configured in `config/auth.php`).

## Steps

1. Back up the database and the current release.
2. Deploy the code, then run:

   ```bash
   composer install --no-dev --optimize-autoloader
   php artisan migrate --force
   php artisan config:cache && php artisan route:cache && php artisan view:cache
   ```

   `migrate` reports nothing to migrate, since there are no schema changes in phase 1.
3. Build the frontend as before (`npm run production`, Laravel Mix). Phase 1 does not touch it.
   From phase 2 on there are two builds, described in the next section.
4. Smoke test:
   - log in and log out;
   - open a protocol;
   - send a contact message, then check `ADMIN_MAIL`;
   - check the ILES and external API endpoints with their tokens.

## Behaviour changes in phase 1

Bug and security fixes; the rest of the behaviour is unchanged (see the tests in
`tests/Feature/Characterization`).

- **The owner check uses the URL's protocol id.** It can no longer be redirected with a query parameter.
- **New login requirement.** `protocols/mine`, `protocols/mine-published`, `protocols/linked/{id}`, `channels/mine`, all `channel/*` endpoints and `translate` now require a logged-in, verified user. Opening a message channel always uses the logged-in user as the questioner. `translate` is limited to 20 calls per minute.
- **Contact form limit.** It accepts 10 messages per minute, as intended (it was effectively 5).
- **ILES errors no longer include the exception.** It is logged instead.
- **Drafts stay private.** Draft news items and draft FAQ questions no longer show on the public site.
- **Smaller fixes:**
  - an unknown page slug returns 404;
  - the news image is kept when an item is created;
  - rejecting an embargo extension without a message no longer errors;
  - the admin password reset returns `{"success": true}`;
  - deleting a news image can no longer touch files outside `public/images/news`.

## From phase 2: the frontend build and an SSR process

```bash
npm ci && npm run build                                   # A2 pages → public/build, bootstrap/ssr
```

- **Node:** 22 LTS or newer.
- **Server-side rendering** for the public pages: keep `php artisan inertia:start-ssr`
  running under a process manager (supervisor or systemd), and restart it after every deploy
  with `php artisan inertia:stop-ssr`. If it is not running, pages fall back to
  client-side rendering, so nothing breaks; search engines just see less.
- **Optional `.env`:** `INERTIA_SSR_ENABLED=false` switches SSR off completely.

## From phase 4: PDFs

- Protocol PDFs and registration certificates are made by dompdf (pure PHP, no system
  packages). It caches font metrics in `storage/fonts`, which must be writable.
- The PDFs read the protocol fields from `resources/data/protocol-schema.json`, exported
  from `resources/js/data/protocol-schema.ts`. `npm run build` fails when the export is
  stale; run `npm run export-schema` and commit the result.

## From phase 6: the legacy SPA is gone

- Only `npm run build` remains; there is no Laravel Mix build any more.
- On the server, `public/js`, `public/css` and `public/mix-manifest.json` are leftovers of the
  old build and can be deleted after the deploy.
- `public/images` keeps the uploads (`images/protocols`, `images/news`); the icons the old build
  copied there are unused. Static images of the A2 pages are in `public/static` (in git).
- Unknown URLs, and pages a user may not open, show the A2 error page; API and JSON requests
  keep JSON errors.
- **The JSON API of the former SPA is removed** (phase 6b). Only the two integrations remain:
  `POST /api/iles/protocol` (ILES token) and `GET /api/external/viewable-protocols` (API key),
  unchanged. Every other `/api/*` path now answers 404 `invalid_api_route`, e.g.
  `/api/protocol*`, `/api/protocols*`, `/api/channel*`, `/api/news-item*`, `/api/faq*`,
  `/api/page*`, `/api/ambassador*`, `/api/embargo-*`, `/api/users*`, `/api/translate`,
  `/api/contact-form`, `/api/update-profile`, `/api/update-setting` and `/api/user`. If another
  system turns out to call one of them, restore it from git (commit "Phase 6b").
- `POST /change-password` (which did not ask for the current password) is gone; users change
  their password on the profile page, admins help through Admin → Users.
- Laravel Sanctum is removed. The `personal_access_tokens` table can stay or be dropped.

## Amendments wait for review

- New table `amendments` (migration `2026_10_16_150000`). Changes to a published protocol are
  stored there until the PCT team approves them; the protocol stays published and public.
- Legacy protocols with status `resubmitted_for_publication` that already had an approval are
  amendments made the old way: they left the register when they were sent. They still show in
  the review queue as "Resubmitted" and are published again on approval.
