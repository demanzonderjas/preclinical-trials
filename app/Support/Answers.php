<?php

namespace App\Support;

/**
 * Compares stored protocol answers by what they say, not by how they were serialised.
 *
 * The answers a reviewer saw are kept in `review_rounds.snapshot`, a MySQL JSON column.
 * MySQL stores JSON objects with their keys sorted (by length, then alphabetically), so a
 * study centre saved as {name, city, country} comes back as {city, name, country}. Compared
 * as JSON text, every protocol with a study centre (and some legacy study arms) looked
 * changed although nobody touched it. resources/js/lib/answers.ts is the TypeScript
 * namesake for the researcher's feedback page; AnswersTest keeps the two in step.
 *
 * Normalised: object keys are sorted; objects and stdClass compare alike; lists keep their
 * order (moving a centre up is a change); numbers compare as their text ("12" = 12);
 * strings are trimmed with Windows line ends made "\n"; and empty answers ("", null, [],
 * a list of rows left blank) are all "no answer".
 */
class Answers
{
    public static function same(mixed $before, mixed $after): bool
    {
        return self::normalise($before) === self::normalise($after);
    }

    /**
     * The keys whose answers differ between two sets of answers.
     *
     * @param  array<string, mixed>  $before
     * @param  array<string, mixed>  $after
     * @return array<int, string>
     */
    public static function changedKeys(array $before, array $after): array
    {
        $keys = array_unique([...array_keys($before), ...array_keys($after)]);

        return array_values(array_filter($keys, fn ($key) => ! self::same($before[$key] ?? null, $after[$key] ?? null)));
    }

    public static function normalise(mixed $value): mixed
    {
        if (is_object($value)) {
            $value = get_object_vars($value);
        }
        if (is_array($value)) {
            $list = array_is_list($value);
            $items = array_filter(array_map(self::normalise(...), $value), fn ($item) => $item !== null);
            if (! $items) {
                return null;
            }
            if ($list) {
                return array_values($items);
            }
            ksort($items, SORT_STRING);

            return $items;
        }
        if (is_string($value)) {
            $value = trim(str_replace(["\r\n", "\r"], "\n", $value));

            return $value === '' ? null : $value;
        }
        if (is_int($value) || is_float($value)) {
            return (string) $value;
        }
        if (is_bool($value)) {
            return $value ? 'true' : 'false';
        }

        return $value;
    }
}
