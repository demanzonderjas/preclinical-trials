<?php

namespace App\Services;

use App\Support\Html;
use Illuminate\Support\Collection;

/**
 * The protocol field schema for the backend, read from resources/data/protocol-schema.json
 * (exported from resources/js/data/protocol-schema.ts by `npm run export-schema`).
 * isVisible() and format() follow their TypeScript namesakes; ProtocolSchemaTest keeps
 * them in step.
 */
class ProtocolSchema
{
    private static ?array $schema = null;

    /** @return Collection<int, array<string, mixed>> */
    public static function fields(): Collection
    {
        return collect(self::schema()['fields']);
    }

    public static function field(string $key): ?array
    {
        return self::fields()->firstWhere('key', $key);
    }

    /** What ProtocolImages::store() names an upload (the legacy upload used the same). */
    public const IMAGE_NAME = '/^\d+-[A-Za-z0-9]{16}\.[a-z0-9]{2,5}$/';

    /**
     * Answers as they may be stored:
     * - long answers that hold markup are reduced to what the answer editor makes (see
     *   App\Support\Html::answer); plain-text answers stay as typed, "<" included;
     * - links lose script schemes (a link answer may also be "PubMed 12345", so no stricter);
     * - image answers only name uploaded files.
     *
     * @param  array<string, mixed>  $values
     * @return array<string, mixed>
     */
    public static function cleanAnswers(array $values): array
    {
        foreach ($values as $key => $value) {
            $type = self::field($key)['type'] ?? null;
            if (is_string($value) && $key !== 'sum_of_animals' && $type === 'longtext' && preg_match('/<\/?[a-z][^>]*>/i', $value)) {
                $values[$key] = Html::answer($value);
            } elseif (is_string($value) && $type === 'url' && preg_match('/^[\x00-\x20]*(javascript|vbscript|data|file):/i', $value)) {
                $values[$key] = '';
            } elseif (in_array($type, ['image', 'images'], true)) {
                // The legacy form stored every image answer as a list; the A2 form stores one
                // image as a name. Both shapes stay as they are.
                $valid = fn ($file) => is_string($file) && preg_match(self::IMAGE_NAME, $file);
                $values[$key] = is_array($value) ? array_values(array_filter($value, $valid)) : ($valid($value) ? $value : null);
            }
        }

        return $values;
    }

    /** @return array<string, string> */
    public static function designGroups(): array
    {
        return self::schema()['designGroups'];
    }

    /**
     * @param  array<string, mixed>  $field
     * @param  array<string, mixed>  $values
     */
    public static function isVisible(array $field, array $values): bool
    {
        foreach ($field['showIf'] ?? [] as $condition) {
            $actual = $values[$condition['key']] ?? null;
            $holds = (self::field($condition['key'])['type'] ?? null) === 'checkboxes'
                ? self::meetsListCondition($condition, self::toList($actual))
                : self::meetsScalarCondition($condition, $actual);
            if (! $holds) {
                return false;
            }
        }

        return true;
    }

    /**
     * Display text for a stored value, or null for empty values and the types that are
     * rendered specially (study arms, centres, images).
     *
     * @param  array<string, mixed>  $field
     */
    public static function format(array $field, mixed $value): ?string
    {
        if (in_array($field['type'], ['study_arms', 'study_centres', 'image', 'images'], true) || $value === null || $value === '') {
            return null;
        }
        if ($field['type'] === 'boolean') {
            return in_array($value, [true, 1, '1', 'true'], true) ? 'Yes' : 'No';
        }
        if (is_array($value) && array_is_list($value)) {
            $parts = array_map(fn ($item) => self::formatScalar($field, (string) $item), array_filter($value, fn ($item) => $item !== null && $item !== '' && is_scalar($item)));

            return $parts ? implode(', ', $parts) : null;
        }
        if (is_array($value) || is_object($value)) {
            return null;
        }

        return self::formatScalar($field, is_bool($value) ? ($value ? 'true' : 'false') : (string) $value);
    }

    /**
     * How far a protocol is filled in: the share of required questions answered (only those
     * that show for the current answers) and the first step with one open. Mirrors
     * draftProgress() in resources/js/lib/workspace.ts.
     *
     * @param  array<string, mixed>  $values
     * @return array{percent: int, missing: int, required: int, next_step: ?int}
     */
    public static function progress(array $values): array
    {
        $required = self::fields()->filter(fn ($field) => $field['required'] && self::isVisible($field, $values));
        $missing = $required->reject(fn ($field) => self::filled($values[$field['key']] ?? null));

        return [
            'percent' => $required->count() ? (int) round(($required->count() - $missing->count()) / $required->count() * 100) : 0,
            'missing' => $missing->count(),
            'required' => $required->count(),
            'next_step' => $missing->min('step'),
        ];
    }

    private static function filled(mixed $value): bool
    {
        if (is_array($value)) {
            return count($value) > 0;
        }
        if (is_object($value)) {
            return true; // as in the TypeScript, where String({}) is not empty
        }

        return $value !== null && trim(is_bool($value) ? ($value ? 'true' : 'false') : (string) $value) !== '';
    }

    /**
     * Rich text from the legacy editor as plain paragraphs. Scripts, styles and comment markers
     * pasted from Word or web pages go with their contents; only tags go, so "p<0.05 and n>3"
     * stays text.
     */
    public static function plainText(?string $value): string
    {
        $text = preg_replace(['/<!--.*?-->/s', '/<(script|style|title|xml)\b.*?<\/\1\s*>/is', '/<a\b[^>]*(#_mso|msocomanchor)[^>]*>.*?<\/a>/is', Html::ESCAPED_HEAD], '', (string) $value);
        $text = preg_replace(['/<br\s*\/?>/i', '/<\/(p|div|li|h\d)>/i'], "\n", $text);
        $text = preg_replace('/<\/?[a-z][^<>]*>/i', '', $text);

        return trim(preg_replace("/\n{3,}/", "\n\n", html_entity_decode($text, ENT_QUOTES | ENT_HTML5)));
    }

    /**
     * A stored value that is not one of the options, as readable text: older answers hold
     * retired spellings and free text the legacy form turned into keys
     * ("outcome_assessors_are_blinded" becomes "Outcome assessors are blinded").
     */
    public static function readable(string $value): string
    {
        return ucfirst(trim(str_replace('_', ' ', $value)));
    }

    private static function formatScalar(array $field, string $value): string
    {
        return match ($field['type']) {
            'select', 'radio', 'checkboxes', 'yesno' => collect($field['options'] ?? [])->firstWhere('value', $value)['label'] ?? self::readable($value),
            'date' => preg_match('/^(\d{4})-(\d{2})-(\d{2})/', $value, $m) && (int) $m[2] >= 1 && (int) $m[2] <= 12
                ? ((int) $m[3]).' '.date('F', mktime(0, 0, 0, (int) $m[2], 1)).' '.$m[1]
                : $value,
            'url' => trim(strip_tags($value)),
            default => $value,
        };
    }

    private static function meetsScalarCondition(array $condition, mixed $actual): bool
    {
        if (array_key_exists('equals', $condition)) {
            return in_array($actual, (array) $condition['equals'], true);
        }
        if (array_key_exists('notIn', $condition)) {
            return ! in_array($actual, $condition['notIn'], true);
        }
        if (array_key_exists('includes', $condition)) {
            return match (true) {
                is_string($actual) => str_contains($actual, $condition['includes']),
                is_array($actual) => in_array($condition['includes'], $actual, true),
                default => false,
            };
        }

        // overlaps: loose comparison, as in the legacy array_has_overlap.
        return is_array($actual) && collect($actual)->contains(fn ($value) => collect($condition['overlaps'])->contains(fn ($other) => $value == $other));
    }

    /** @param  array<int, string>  $actual */
    private static function meetsListCondition(array $condition, array $actual): bool
    {
        if (array_key_exists('equals', $condition)) {
            return (bool) array_intersect($actual, (array) $condition['equals']);
        }
        if (array_key_exists('notIn', $condition)) {
            return (bool) array_diff($actual, $condition['notIn']);
        }
        if (array_key_exists('includes', $condition)) {
            return in_array($condition['includes'], $actual, true);
        }

        return collect($actual)->contains(fn ($value) => collect($condition['overlaps'])->contains(fn ($other) => $value == $other));
    }

    /** @return array<int, string> */
    private static function toList(mixed $value): array
    {
        if (is_array($value)) {
            return array_map('strval', array_values($value));
        }

        return $value === null || $value === '' ? [] : [(string) $value];
    }

    private static function schema(): array
    {
        return self::$schema ??= json_decode(file_get_contents(resource_path('data/protocol-schema.json')), true, flags: JSON_THROW_ON_ERROR);
    }
}
