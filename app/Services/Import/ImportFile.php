<?php

namespace App\Services\Import;

/**
 * The text of an uploaded import file as UTF-8, whatever the program that saved it used:
 * a byte order mark (UTF-8, UTF-16, UTF-32), UTF-16 without one, or Windows-1252 / Latin-1
 * (Excel and older Windows tools). Also recognises files that are not text at all, so the
 * researcher hears what they uploaded instead of "not a PRIS file".
 */
class ImportFile
{
    /**
     * @throws ImportException
     */
    public static function text(string $bytes): string
    {
        if (trim($bytes) === '') {
            throw new ImportException('The file is empty. Export the protocol again and import the new file.');
        }

        self::rejectBinary($bytes);

        $boms = [
            "\x00\x00\xFE\xFF" => 'UTF-32BE',
            "\xFF\xFE\x00\x00" => 'UTF-32LE',
            "\xEF\xBB\xBF" => 'UTF-8',
            "\xFE\xFF" => 'UTF-16BE',
            "\xFF\xFE" => 'UTF-16LE',
        ];
        foreach ($boms as $bom => $encoding) {
            if (str_starts_with($bytes, $bom)) {
                $text = substr($bytes, strlen($bom));

                return self::normalise($encoding === 'UTF-8' ? self::utf8($text) : self::convert($text, $encoding));
            }
        }

        // UTF-16 without a byte order mark: every other byte of plain text is zero.
        $sample = substr($bytes, 0, 200);
        $zeros = substr_count($sample, "\x00");
        if ($zeros > strlen($sample) / 4) {
            $even = substr_count(implode('', array_map(fn ($i) => $sample[$i] ?? '', range(0, strlen($sample) - 1, 2))), "\x00");

            return self::normalise(self::convert($bytes, $even > $zeros / 2 ? 'UTF-16BE' : 'UTF-16LE'));
        }

        return self::normalise(self::utf8($bytes));
    }

    /** UTF-8 as is; anything else is read as Windows-1252, a superset of Latin-1. */
    private static function utf8(string $text): string
    {
        return mb_check_encoding($text, 'UTF-8') ? $text : self::convert($text, 'Windows-1252');
    }

    private static function convert(string $text, string $from): string
    {
        $converted = @mb_convert_encoding($text, 'UTF-8', $from);
        if (! is_string($converted) || ! mb_check_encoding($converted, 'UTF-8')) {
            throw new ImportException("The file's text encoding ($from) could not be read. Save it as UTF-8 and try again.");
        }

        return $converted;
    }

    /** Stray NUL bytes go; line endings (\n, \r\n, \r) can stay, both parsers accept them. */
    private static function normalise(string $text): string
    {
        return str_replace("\x00", '', $text);
    }

    /**
     * @throws ImportException
     */
    private static function rejectBinary(string $bytes): void
    {
        $kinds = [
            '%PDF' => 'a PDF document',
            "PK\x03\x04" => 'a ZIP archive or an Office document (.docx, .xlsx)',
            "\xD0\xCF\x11\xE0" => 'an old Office document (.doc, .xls)',
            '{\\rtf' => 'a Rich Text (.rtf) document',
            "\x89PNG" => 'an image',
            "\xFF\xD8\xFF" => 'an image',
        ];
        foreach ($kinds as $magic => $kind) {
            if (str_starts_with($bytes, $magic)) {
                throw new ImportException("This file is $kind. Import the export file itself: a PRIS export (.json) or an APAFiS project form (.xml).");
            }
        }
    }
}
