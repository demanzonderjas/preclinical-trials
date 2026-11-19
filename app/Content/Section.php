<?php

namespace App\Content;

/** A part of a page as the PCT team sees it in the admin ("Introduction", "Contact details"). */
final class Section
{
    /** @param  list<Field>  $fields */
    private function __construct(public readonly string $key, public readonly string $label, public readonly array $fields, public readonly ?string $help)
    {
        if (! preg_match('/^[a-z][a-z0-9_]*$/', $key)) {
            throw new \InvalidArgumentException("Section key \"$key\" must be snake_case.");
        }
    }

    /** @param  list<Field>  $fields */
    public static function make(string $key, string $label, array $fields, ?string $help = null): self
    {
        return new self($key, $label, $fields, $help);
    }

    public function field(string $key): ?Field
    {
        foreach ($this->fields as $field) {
            if ($field->key === $key) {
                return $field;
            }
        }

        return null;
    }
}
