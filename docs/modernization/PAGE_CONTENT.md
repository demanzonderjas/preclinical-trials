# Editable page texts

The PCT team edits the texts of the designed pages in **Admin → Content → Pages**. The layout
stays fixed in the React page; each page has a schema in code (sections → fields) with the text
the page shows today as the default. Nothing changes on the site until someone edits a field.

The Contact page is the reference: `app/Content/Pages/ContactPage.php` and
`resources/js/pages/contact.tsx`.

## How it works

| Part | Where |
|---|---|
| Schema of a page | `app/Content/Pages/<Name>Page.php` (extends `App\Content\PageSchema`) |
| Register a page | `config/page-content.php` |
| Field types | `App\Content\Field` |
| Service | `App\Content\PageContent::for('contact')`: defaults merged with stored changes, cleaned |
| Storage | table `page_contents` (`page` unique, `content` json, `updated_by`, timestamps), model `App\Models\PageContentOverride`; only fields that differ from their default are stored |
| Cache | the stored changes per page, forgotten on save (`page-content.<key>`) |
| Shared parts (footer) | `public bool $shared = true` → every Inertia response gets `siteContent.<key>` (`HandleInertiaRequests`) |
| TypeScript types | `resources/js/types/page-content.ts`, generated: `php artisan page-content:types` (a test fails when it is out of date) |
| Rendering helpers | `<RichContent html>` and `<TextLines text>` (`components/ui/RichContent.tsx`), `fill(text, { count })` (`lib/content.ts`) |
| Admin form | `components/admin/PageContentEditor.tsx`, built from the schema; save `PUT /admin/content/page-content/{key}`, images `POST /admin/content/page-images` (→ `public/images/pages`) |
| Tests | `tests/Feature/Admin/PageContentTest.php`, e2e `specs/admin.spec.ts` ("edits the texts of the contact page") |

The disclaimer and privacy statement are the older kind of page: a `pages` row with title,
subtitle and free rich-text sections (`ContentPageController`), edited on the same tab. The
privacy statement starts as the placeholder in `ContentPageController::PLACEHOLDERS`; the first
visit to the Pages tab turns it into a `pages` row with that text. Old `pages` rows the site no
longer shows stay listed read-only under "old pages are not on the website".

## Making a page editable

1. **Write the schema.** Create `app/Content/Pages/HomePage.php`:

   ```php
   class HomePage extends PageSchema
   {
       public string $key = 'home';          // never change once stored
       public string $title = 'Home';        // name in the admin list
       public ?string $url = '/';            // "View page"; null for the footer
       public ?string $description = 'The hero, the figures and the steps.';

       public function sections(): array
       {
           return [
               Section::make('hero', 'Top of the page', [
                   Field::text('title', 'Heading', 'Register your animal study before it starts')->max(90),
                   Field::textarea('text', 'Text under the heading', 'PreclinicalTrials.eu is …')->max(300),
                   Field::link('cta', 'Button', 'Register a protocol', '/dashboard/protocols/new'),
               ]),
               Section::make('aims', 'Our aims', [
                   Field::list('items', 'Aims', [
                       Field::select('icon', 'Icon', ['eye' => 'Eye', 'shield' => 'Shield'], 'eye'),
                       Field::text('title', 'Title', '')->max(60),
                       Field::rich('text', 'Text', '')->max(400),
                   ], [
                       ['icon' => 'eye', 'title' => 'Transparency', 'text' => '<p>…</p>'],
                   ])->items(1, 6),
               ]),
           ];
       }
   }
   ```

2. **Register it** in `config/page-content.php`, then run `php artisan page-content:types`.
3. **Pass it from the controller:** `'content' => PageContent::for('home')`.
4. **Read it in the page:** `type Props = { content: HomeContent; … }`, then replace each
   literal with `content.hero.title` etc. Rich fields go through `<RichContent html={…} className="…" />`;
   multi-line textareas through `<TextLines text={…} />`; placeholders through `fill()`.
   Icons: map the select value to a component in the page (`const icons = { eye: Eye, … }`).
5. **Check it looks identical:** screenshot the page before and after (e2e server,
   `PCT_E2E_PORT=8031`), and edit one field in the admin to see it change.
6. **Test:** extend the page's Feature test with a `content.…` assertion on a default.

## Field types

| Type | Value the page gets | Admin control | Notes |
|---|---|---|---|
| `text($key, $label, $default)` | string | input with counter | max 255 unless `->max()` |
| `textarea(...)` | string, `\n` line breaks | textarea | max 2000; render with `<TextLines>` if lines matter |
| `rich(...)` | cleaned HTML | rich editor without headings/images | `Html::basic`: p, br, b/strong, i/em, u, lists, links. `->max()` counts visible characters |
| `image($key, $label, $src, $alt = '')` | `{src, alt}` | preview, upload/replace, alt text | src must be `/static/…` or an upload in `/images/pages/`, and exist; JPG/PNG/GIF/WebP ≤ 4 MB |
| `link($key, $label, $text, $url)` | `{label, url}` | link text + address | url: `https://`, `mailto:`, `/page` or `#anchor` |
| `select($key, $label, [value => label], $default)` | string | select | e.g. icons from a fixed set |
| `faq($key, $label, $defaultTitle)` | `{id, title}` or `null` | select of published help questions | see below |
| `list($key, $label, [fields], [items])` | array of items | add, remove, up/down | `->items(min, max)`; sub-field defaults fill a new item (use `''`) |

Modifiers: `->help('…')` (shown under the label), `->optional()` (fields are required by
default), `->max(n)`, `->rules(['email'])` (extra Laravel rules).

**Questions (`faq`).** The Contact page used to find its three "Asked most often" questions by
exact title, which broke silently on a rename. Now they are a list of `faq` fields: the default
names a question by title (ids differ per database), the admin picks questions from a select of
published questions, and from the first save on the choice is stored by id, so a rename follows
along. A question that becomes a draft or is deleted is `null` and the page skips it.

**Reset.** Every changed field has "Reset to original text", every section "Reset section to
original text". These put the default back in the form; Save then removes the field from the
stored changes, so it follows the code again (also when the code's default changes later).
Exception: `faq` lists stay stored by id once saved.

## Conventions

- **Keys:** snake_case; sections by their place on the page (`intro`, `hero`, `team`,
  `messages`), fields by their role (`eyebrow`, `title`, `text`, `link`, `items`). Keys are the
  storage format: renaming one loses what the team wrote for it.
- **Labels** in the admin are plain words for the PCT team: "Heading", "Text under the heading",
  "Label above the heading". Sections are named as the visitor sees them.
- **Defaults are copied verbatim** from the current component: same curly quotes (’ “ ”),
  dashes, line breaks and links. Run a pixel comparison of before/after screenshots.
- **One field per visible text**, not per sentence; a sentence with a link becomes a `rich` field.
  Headings stay headings in the component (a `text` field), not rich text.
- **Stays in code:** the page name in the menu, breadcrumb and browser tab; form field labels,
  help texts, placeholders and validation messages of forms; button labels inside interactive
  widgets (Copy address / Copied, Search, Send message); flash, legal and system messages;
  numbers and data from the database (use a `{count}` placeholder with `fill()`).
- **Max lengths** roughly 1.5× the current text, so the layout holds.
- **Shared parts** (the footer): `public bool $shared = true; public ?string $url = null;` and
  read `usePage().props.siteContent.footer` in `components/site/Chrome.tsx`. Its type is
  generated into `SiteContent`.

## Candidates for the page conversions

Texts still in code, besides the page bodies of home, about, help, database and the auth and
workspace pages:

- `resources/js/components/site/Chrome.tsx`: `FOOTER_TEXT` and the footer columns (a shared schema).
- `resources/js/pages/home.tsx`: `VIDEO_CARDS`, `HOME_VIDEO`, `INTRO_VISUAL_TEXT`.
- `resources/js/pages/about.tsx`: `HERO_FIGURE_LABELS`, `BIAS_TERMS`, `AMBASSADOR_TEXT`.
