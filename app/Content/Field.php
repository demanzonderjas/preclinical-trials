<?php

namespace App\Content;

/**
 * One editable piece of text (or image, link, list…) on a page, with the text the page shows
 * when the PCT team has not changed it. See docs/modernization/PAGE_CONTENT.md.
 *
 * Values, as the page receives them:
 *  - text, textarea, rich, select: a string (rich is cleaned HTML)
 *  - link: ['label' => …, 'url' => …]
 *  - image: ['src' => …, 'alt' => …]
 *  - faq: ['id' => …, 'title' => …] of a published help-centre question, or null
 *  - list: a list of items, each an array keyed by the list's own fields
 */
final class Field
{
    public const TYPES = ['text', 'textarea', 'rich', 'image', 'link', 'select', 'faq', 'list'];

    public ?string $help = null;

    public bool $required = true;

    public ?int $max = null;

    /** @var array<string, string> select: value => label */
    public array $options = [];

    /** @var list<Field> list: the fields of one item */
    public array $fields = [];

    public ?int $minItems = null;

    public ?int $maxItems = null;

    /** @var list<string> extra Laravel validation rules for the value, e.g. ['email'] */
    public array $rules = [];

    private function __construct(public readonly string $type, public readonly string $key, public readonly string $label, public readonly mixed $default)
    {
        if (! preg_match('/^[a-z][a-z0-9_]*$/', $key)) {
            throw new \InvalidArgumentException("Field key \"$key\" must be snake_case.");
        }
    }

    /** One line of plain text: a heading, an eyebrow, a label. */
    public static function text(string $key, string $label, string $default): self
    {
        return (new self('text', $key, $label, $default))->max(255);
    }

    /** Plain text over several lines; line breaks are kept. */
    public static function textarea(string $key, string $label, string $default): self
    {
        return (new self('textarea', $key, $label, $default))->max(2000);
    }

    /** Paragraphs with bold, italic, links and lists (no headings or images). */
    public static function rich(string $key, string $label, string $default): self
    {
        return (new self('rich', $key, $label, $default))->max(20000);
    }

    /** An image from public/static or uploaded in the admin, with its alt text ('' = decorative). */
    public static function image(string $key, string $label, string $src, string $alt = ''): self
    {
        return new self('image', $key, $label, ['src' => $src, 'alt' => $alt]);
    }

    /** A link: the text people click and where it goes (https://…, mailto:… or /a-page). */
    public static function link(string $key, string $label, string $text, string $url): self
    {
        return new self('link', $key, $label, ['label' => $text, 'url' => $url]);
    }

    /** One value from a fixed set, e.g. an icon. @param array<string, string> $options value => label */
    public static function select(string $key, string $label, array $options, string $default): self
    {
        $field = new self('select', $key, $label, $default);
        $field->options = $options;

        return $field;
    }

    /**
     * A question from the help centre, chosen in the admin. The default names the question by its
     * title (ids differ per database); once the page is saved, the chosen id is kept, so renaming
     * the question later does not break the link.
     */
    public static function faq(string $key, string $label, string $defaultTitle): self
    {
        return new self('faq', $key, $label, $defaultTitle);
    }

    /**
     * Repeatable items (team members, aims, shortcuts…) the PCT team adds, removes and reorders.
     *
     * @param  list<Field>  $fields  the fields of one item; their defaults fill a new item
     * @param  list<array<string, mixed>>  $default  the items the page shows today
     */
    public static function list(string $key, string $label, array $fields, array $default): self
    {
        $field = new self('list', $key, $label, $default);
        $field->fields = $fields;

        return $field;
    }

    public function help(string $help): self
    {
        $this->help = $help;

        return $this;
    }

    /** May be left empty (text, textarea, rich, image, faq). */
    public function optional(): self
    {
        $this->required = false;

        return $this;
    }

    /** At most this many characters (text, textarea, rich). */
    public function max(int $characters): self
    {
        $this->max = $characters;

        return $this;
    }

    /** list: how many items there may be. */
    public function items(?int $min = null, ?int $max = null): self
    {
        $this->minItems = $min;
        $this->maxItems = $max;

        return $this;
    }

    /** @param  list<string>  $rules */
    public function rules(array $rules): self
    {
        $this->rules = $rules;

        return $this;
    }

    public function subField(string $key): ?self
    {
        foreach ($this->fields as $field) {
            if ($field->key === $key) {
                return $field;
            }
        }

        return null;
    }

    /** The value of this field in a new list item (and in stored items that lack it). */
    public function blank(): mixed
    {
        return $this->type === 'faq' ? null : $this->default;
    }
}
