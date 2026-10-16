# Frontend

Two frontends live side by side until every page is rebuilt in the A2 design.

| | New (A2) | Legacy |
|---|---|---|
| Code | `resources/js`, `resources/css` | `resources/legacy/js`, `resources/legacy/sass` |
| Stack | Inertia 3, React 19, TypeScript, Tailwind 4, Vite | React 16, MobX, React Router 5, Laravel Mix |
| Served by | `Inertia::render('page-name')` with root view `resources/views/app.blade.php` | `view('index')` routes and the fallback in `routes/web.php` |
| Build | `npm run build` (repo root) | `cd resources/legacy && npm run production` |
| Output | `public/build`, `bootstrap/ssr` | `public/js/index.js`, `public/css/app.css` |

A request goes to whichever frontend owns its route. Moving a page means adding an
Inertia route above the legacy fallback and pointing `resources/js/lib/routes.ts` at it.
At cutover (phase 6), `resources/legacy`, `resources/views/index.blade.php` and the
legacy JSON endpoints the new pages no longer use are deleted.

## Structure

```
resources/css/app.css          Tailwind 4 + the A2 tokens (@theme). Default palette is off.
resources/js/app.tsx            Inertia entry (also the SSR entry, via @inertiajs/vite)
resources/js/pages/             One file per Inertia page, e.g. pages/database/index.tsx
resources/js/layouts/           PublicLayout, AuthLayout, WorkspaceLayout, AdminLayout
resources/js/components/ui/     The component kit (see /design-system)
resources/js/components/site/   Headers and footers
resources/js/lib/routes.ts      Every URL the layouts link to
resources/js/lib/dates.ts       Date formatting in the PCT time zone (identical on server and browser)
resources/js/data/protocol-schema.ts  The protocol fields; exported to resources/data/*.json for PHP
```

## Conventions

- **Use the kit.** Buttons, badges, fields, cards and tables come from `components/ui`.
  The preview at `/design-system` (any non-production environment, or admins) shows
  everything in each layout; compare it with the A2 Brand board.
- **Tokens, not values.** Colours exist only as brand tokens (`bg-teal-50`,
  `text-ink-muted`, `bg-peach-300` and so on). Arbitrary pixel values are fine where
  the artboard needs them; arbitrary colours are not.
- **One peach call to action per page at most** (`variant="accent"`).
- **Forms.** Wrap every control in `Field` so label, help and error are wired up. Put
  errors from Laravel validation into `error`.
- **Mobile first.** Follow the responsive rules in PLAN.md §6. Tables use `DataTable`,
  which becomes cards below 768 px.
- **Server-side rendering.** Pages render on the server, so keep
  `window`/`document` access inside effects and event handlers, and format dates with
  `lib/dates.ts` (fixed time zone and month names) so both renders agree.
- **Icons** come from `lucide-react`, at a stroke width of 2–2.4 to match the artboards.
- **Fonts** are self-hosted through `@fontsource-variable/*`, with no requests to Google.

## Development

```bash
composer install && npm install
(cd resources/legacy && npm install && npm run development)   # legacy pages
npm run dev                                                    # Vite + SSR in dev
php artisan serve
```
