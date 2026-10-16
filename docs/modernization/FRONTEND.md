# Frontend

Every page is an Inertia page in the A2 design (the legacy React 16 SPA was removed in
phase 6).

| | |
|---|---|
| Code | `resources/js`, `resources/css` |
| Stack | Inertia 3, React 19, TypeScript, Tailwind 4, Vite |
| Served by | `Inertia::render('page-name')` with root view `resources/views/app.blade.php` |
| Build | `npm run build` |
| Output | `public/build`, `bootstrap/ssr` |
| Static images | `public/static` (in the repository); uploads stay in `public/images` (on the server) |

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
- **Long answers** (schema type `longtext`) are edited with `protocol-form/AnswerEditor`
  (Tiptap: paragraphs, bold, italic, underline, lists, links; Markdown-style shortcuts) and
  stored as that small subset of HTML. Paste from Word, Google Docs, PDFs or web pages is
  repaired in `lib/rich-text.ts` (Word's typed bullets become real lists, tables become one
  line per row, PDF line wraps are joined, styling goes). Show an answer with
  `ui/RichAnswer`, which builds React elements from an allowlist and never uses
  `innerHTML`; older answers may be plain text or legacy-editor HTML and both work. The
  server cleans answers again on save (`ProtocolSchema::cleanAnswers`, `Html::answer`).
- **Icons** come from `lucide-react`, at a stroke width of 2–2.4 to match the artboards.
- **Fonts** are self-hosted through `@fontsource-variable/*`, with no requests to Google.

## Development

```bash
composer install && npm install
npm run dev                                                    # Vite + SSR in dev
php artisan serve
```
