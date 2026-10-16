<?php

namespace App\Support;

use Symfony\Component\HttpFoundation\StreamedResponse;

/** CSV downloads that open well in Excel and cannot smuggle in formulas. */
class Csv
{
    /**
     * @param  array<string, string|callable>  $columns  header => row key or fn($row)
     * @param  iterable<mixed>  $rows
     */
    public static function download(string $filename, array $columns, iterable $rows): StreamedResponse
    {
        return response()->streamDownload(function () use ($columns, $rows) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF"); // UTF-8 BOM, so Excel shows accents correctly.
            fputcsv($out, array_keys($columns), escape: '');
            foreach ($rows as $row) {
                fputcsv($out, array_map(fn ($column) => self::cell(is_callable($column) ? $column($row) : data_get($row, $column)), $columns), escape: '');
            }
            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    /** Text starting with = + - @ (or a tab or return) would run as a formula; quote it. */
    public static function cell(mixed $value): string
    {
        $text = is_bool($value) ? ($value ? 'yes' : 'no') : (string) ($value ?? '');

        return $text !== '' && in_array($text[0], ['=', '+', '-', '@', "\t", "\r"], true) && ! is_numeric($text) ? "'".$text : $text;
    }
}
