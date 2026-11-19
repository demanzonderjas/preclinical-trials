<?php

namespace App\Content;

use App\Models\FaqItem;
use App\Models\PageContentOverride;
use App\Models\User;
use App\Support\Html;
use Closure;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;
use InvalidArgumentException;

/**
 * The editable texts of the designed pages: the defaults in app/Content/Pages merged with what
 * the PCT team changed in the admin (table page_contents).
 *
 *     PageContent::for('contact')   // ['intro' => ['title' => 'Get in touch', …], …]
 *
 * Only fields that differ from their default are stored, so a field the team never touched
 * keeps following the code. See docs/modernization/PAGE_CONTENT.md.
 */
class PageContent
{
    /** Where images uploaded for pages are stored (under public/). */
    public const IMAGE_DIR = 'images/pages';

    /** Images may come from the site's own static files or from uploads. */
    private const IMAGE_SRC = '#^/(static|images/pages)/[A-Za-z0-9][A-Za-z0-9._/-]*$#';

    /** Links: web addresses, email addresses, pages of the site and anchors. */
    private const URL = '#^(https?://[^\s]+|mailto:[^\s]+|/[^\s/][^\s]*|/|\#[^\s]*)$#i';

    /** @var array<string, PageSchema> */
    private static array $schemas = [];

    /** @var array<int, string>|null published help-centre questions, id => title, per request */
    private static ?array $questions = null;

    /** @return array<string, PageSchema> every registered page, by key */
    public static function pages(): array
    {
        $pages = [];
        foreach (config('page-content.pages', []) as $class) {
            $schema = self::$schemas[$class] ??= new $class;
            $pages[$schema->key] = $schema;
        }

        return $pages;
    }

    public static function has(string $key): bool
    {
        return array_key_exists($key, self::pages());
    }

    public static function schema(string $key): PageSchema
    {
        return self::pages()[$key] ?? throw new InvalidArgumentException("No editable page \"$key\" (config/page-content.php).");
    }

    /** The texts of a page as the page renders them: defaults with the stored changes, cleaned. */
    public static function for(string $key): array
    {
        self::$questions = null;
        $values = self::values($key);
        $out = [];
        foreach (self::schema($key)->sections() as $section) {
            foreach ($section->fields as $field) {
                $out[$section->key][$field->key] = self::present($field, $values[$section->key][$field->key]);
            }
        }

        return $out;
    }

    /** The pages marked `shared` (the footer…), for every Inertia response. */
    public static function shared(): array
    {
        $out = [];
        foreach (self::pages() as $key => $schema) {
            if ($schema->shared) {
                $out[$key] = self::for($key);
            }
        }

        return $out;
    }

    /** The current values as the admin form edits them: questions as ids. */
    public static function editorValues(string $key): array
    {
        return self::forEditor($key, self::values($key));
    }

    /** The default values as the admin form edits them, for "Reset to original text". */
    public static function editorDefaults(string $key): array
    {
        return self::forEditor($key, self::defaults($key));
    }

    /** The current values: the stored change of each field, or its default. */
    public static function values(string $key): array
    {
        $stored = self::stored($key);
        $values = [];
        foreach (self::schema($key)->sections() as $section) {
            foreach ($section->fields as $field) {
                $has = is_array($stored[$section->key] ?? null) && array_key_exists($field->key, $stored[$section->key]);
                $values[$section->key][$field->key] = $has
                    ? self::normalize($field, $stored[$section->key][$field->key])
                    : self::normalize($field, $field->default);
            }
        }

        return $values;
    }

    /** The default value of every field. */
    public static function defaults(string $key): array
    {
        $values = [];
        foreach (self::schema($key)->sections() as $section) {
            foreach ($section->fields as $field) {
                $values[$section->key][$field->key] = self::normalize($field, $field->default);
            }
        }

        return $values;
    }

    /**
     * Saves the texts from the admin form (validated with rules()). Fields equal to their
     * default are not stored, so "Reset to original text" followed by Save follows the code again.
     */
    public static function save(string $key, array $input, ?User $by): PageContentOverride
    {
        $changed = [];
        foreach (self::schema($key)->sections() as $section) {
            foreach ($section->fields as $field) {
                $value = self::normalize($field, $input[$section->key][$field->key] ?? null);
                // A question's default is its title; a saved choice is its id, so it is kept.
                if ($value !== self::normalize($field, $field->default)) {
                    $changed[$section->key][$field->key] = $value;
                }
            }
        }

        $record = PageContentOverride::firstOrNew(['page' => $key]);
        $record->content = $changed;
        $record->updated_by = $by?->id;
        $record->updated_at = now();
        $record->save();
        Cache::forget(self::cacheKey($key));

        return $record;
    }

    /** The last change: when and by whom, or null while the page shows the original text. */
    public static function lastEdit(string $key): ?PageContentOverride
    {
        return PageContentOverride::with('editor:id,first_name,last_name')->where('page', $key)->first();
    }

    /** Validation rules for the admin form, keyed content.<section>.<field>. */
    public static function rules(string $key): array
    {
        $rules = ['content' => ['required', 'array']];
        foreach (self::schema($key)->sections() as $section) {
            $rules["content.{$section->key}"] = ['required', 'array'];
            foreach ($section->fields as $field) {
                $rules += self::fieldRules($field, "content.{$section->key}.{$field->key}");
            }
        }

        return $rules;
    }

    /** Field labels for the validation messages ("The Heading field is required."). */
    public static function attributes(string $key): array
    {
        $names = [];
        foreach (self::schema($key)->sections() as $section) {
            foreach ($section->fields as $field) {
                $path = "content.{$section->key}.{$field->key}";
                $names[$path] = $field->label;
                foreach (['label' => 'link text', 'url' => 'link address', 'src' => 'image', 'alt' => 'alt text'] as $part => $name) {
                    $names["$path.$part"] = "{$field->label} ($name)";
                }
                foreach ($field->fields as $sub) {
                    $names["$path.*.{$sub->key}"] = $sub->label;
                    foreach (['label' => 'link text', 'url' => 'link address', 'src' => 'image', 'alt' => 'alt text'] as $part => $name) {
                        $names["$path.*.{$sub->key}.$part"] = "{$sub->label} ($name)";
                    }
                }
            }
        }

        return $names;
    }

    /** The schema as the admin form builds itself from it. */
    public static function describe(string $key): array
    {
        return array_map(fn (Section $section) => [
            'key' => $section->key,
            'label' => $section->label,
            'help' => $section->help,
            'fields' => array_map(self::describeField(...), $section->fields),
        ], self::schema($key)->sections());
    }

    /** Published help-centre questions for the faq fields' select. */
    public static function questionOptions(): array
    {
        return FaqItem::where('status', '!=', 'draft')->with('faqCategory:id,name')->orderBy('faq_category_id')->orderBy('order')->orderBy('id')->get(['id', 'title', 'faq_category_id'])
            ->map(fn (FaqItem $item) => ['value' => $item->id, 'label' => $item->title, 'group' => $item->faqCategory?->name ?? 'Other'])
            ->values()->all();
    }

    /* -------------------------------------------------------------------------------------- */

    private static function cacheKey(string $key): string
    {
        return "page-content.$key";
    }

    /** The stored changes of a page, cached until the next save. */
    private static function stored(string $key): array
    {
        return Cache::rememberForever(self::cacheKey($key), fn () => PageContentOverride::where('page', $key)->value('content') ?? []);
    }

    /** A value in the shape of its field, cleaned; anything that does not fit becomes empty. */
    private static function normalize(Field $field, mixed $value): mixed
    {
        return match ($field->type) {
            'text' => trim(self::string($value)),
            'textarea' => trim(str_replace(["\r\n", "\r"], "\n", self::string($value))),
            'rich' => Html::basic(self::string($value)),
            'select' => array_key_exists(self::string($value), $field->options) ? self::string($value) : $field->default,
            'link' => ['label' => trim(self::string($value['label'] ?? null)), 'url' => trim(self::string($value['url'] ?? null))],
            'image' => self::image($value),
            'faq' => self::question($value),
            'list' => array_values(array_map(fn ($item) => self::item($field, is_array($item) ? $item : []), array_filter(is_array($value) ? $value : [], 'is_array'))),
            default => throw new InvalidArgumentException("Unknown field type {$field->type}."),
        };
    }

    private static function item(Field $list, array $item): array
    {
        $out = [];
        foreach ($list->fields as $sub) {
            $out[$sub->key] = self::normalize($sub, array_key_exists($sub->key, $item) ? $item[$sub->key] : $sub->blank());
        }

        return $out;
    }

    private static function string(mixed $value): string
    {
        return is_string($value) || is_int($value) || is_float($value) ? (string) $value : '';
    }

    private static function image(mixed $value): array
    {
        $src = trim(self::string($value['src'] ?? null));

        return ['src' => self::safeImage($src) ? $src : '', 'alt' => trim(self::string($value['alt'] ?? null))];
    }

    private static function safeImage(string $src): bool
    {
        return (bool) preg_match(self::IMAGE_SRC, $src) && ! str_contains($src, '..');
    }

    /** A question as an id (saved choice) or a title (default); a title stays a title. */
    private static function question(mixed $value): int|string|null
    {
        if (is_int($value) || (is_string($value) && ctype_digit($value))) {
            return (int) $value;
        }

        return is_string($value) && trim($value) !== '' ? trim($value) : null;
    }

    /** A value as the page renders it: questions become ['id', 'title'] or null. */
    private static function present(Field $field, mixed $value): mixed
    {
        return match ($field->type) {
            'faq' => self::resolveQuestion($value),
            'list' => self::mapItems($field, $value, self::present(...)),
            default => $value,
        };
    }

    /** A value as the admin form edits it: questions become their id or null. */
    private static function editable(Field $field, mixed $value): mixed
    {
        return match ($field->type) {
            'faq' => self::resolveQuestion($value)['id'] ?? null,
            'list' => self::mapItems($field, $value, self::editable(...)),
            default => $value,
        };
    }

    private static function mapItems(Field $list, array $items, Closure $map): array
    {
        return array_map(function (array $item) use ($list, $map) {
            foreach ($list->fields as $sub) {
                $item[$sub->key] = $map($sub, $item[$sub->key]);
            }

            return $item;
        }, $items);
    }

    private static function forEditor(string $key, array $values): array
    {
        self::$questions = null;
        foreach (self::schema($key)->sections() as $section) {
            foreach ($section->fields as $field) {
                $values[$section->key][$field->key] = self::editable($field, $values[$section->key][$field->key]);
            }
        }

        return $values;
    }

    private static function resolveQuestion(int|string|null $value): ?array
    {
        self::$questions ??= FaqItem::where('status', '!=', 'draft')->pluck('title', 'id')->all();
        $id = is_int($value) ? $value : array_search($value, self::$questions, true);

        return $id !== false && $id !== null && isset(self::$questions[$id]) ? ['id' => (int) $id, 'title' => self::$questions[$id]] : null;
    }

    private static function fieldRules(Field $field, string $path): array
    {
        $presence = $field->required ? 'required' : 'nullable';

        return match ($field->type) {
            'text', 'textarea' => [$path => [$presence, 'string', 'max:'.($field->max ?? 255), ...$field->rules]],
            // The limit counts the visible text, not the markup.
            'rich' => [$path => [$presence, 'string', 'max:'.(($field->max ?? 20000) * 4), self::maxText($field->max ?? 20000), ...$field->rules]],
            'select' => [$path => ['required', Rule::in(array_keys($field->options))]],
            'link' => [
                $path => ['required', 'array'],
                "$path.label" => ['required', 'string', 'max:160'],
                "$path.url" => ['required', 'string', 'max:2000', 'regex:'.self::URL],
            ],
            'image' => [
                $path => [$presence, 'array'],
                "$path.src" => [$presence, 'string', 'max:255', self::imageExists()],
                "$path.alt" => ['nullable', 'string', 'max:255'],
            ],
            'faq' => [$path => [$presence, 'integer', Rule::exists('faq_items', 'id')->where(fn ($query) => $query->where('status', '!=', 'draft'))]],
            'list' => array_merge(
                [$path => ['present', 'array', ...($field->minItems !== null ? ["min:{$field->minItems}"] : []), ...($field->maxItems !== null ? ["max:{$field->maxItems}"] : [])]],
                ...array_map(fn (Field $sub) => self::fieldRules($sub, "$path.*.{$sub->key}"), $field->fields),
            ),
        };
    }

    private static function maxText(int $max): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail) use ($max) {
            if (is_string($value) && mb_strlen(trim(html_entity_decode(strip_tags($value)))) > $max) {
                $fail("The :attribute may not be longer than $max characters.");
            }
        };
    }

    private static function imageExists(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail) {
            if (! is_string($value) || ! self::safeImage($value) || ! is_file(public_path(ltrim($value, '/')))) {
                $fail('The :attribute must be an image uploaded here.');
            }
        };
    }

    private static function describeField(Field $field): array
    {
        return array_filter([
            'key' => $field->key,
            'type' => $field->type,
            'label' => $field->label,
            'help' => $field->help,
            'required' => $field->required,
            'max' => $field->max,
            'options' => $field->options ? array_map(fn ($value, $label) => ['value' => (string) $value, 'label' => $label], array_keys($field->options), $field->options) : null,
            'fields' => $field->fields ? array_map(self::describeField(...), $field->fields) : null,
            'min_items' => $field->minItems,
            'max_items' => $field->maxItems,
            'blank' => $field->type === 'list' ? null : self::normalize($field, $field->blank()),
        ], fn ($value) => $value !== null);
    }
}
