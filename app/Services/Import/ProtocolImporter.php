<?php

namespace App\Services\Import;

use App\Models\ActivityLog;
use App\Models\ImportLog;
use App\Models\Protocol;
use App\Models\User;
use App\Services\ProtocolSchema;
use App\Services\Translator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

/**
 * Starts a new draft from a PRIS (.json) or APAFiS (.xml) file. Importing never touches an
 * existing protocol, so answers already typed are safe. The file may be in any common text
 * encoding (see ImportFile); what cannot be read is reported as an ImportException.
 */
class ProtocolImporter
{
    public function __construct(private Translator $translator) {}

    /**
     * @return array{protocol: Protocol, source: string, untranslated: int, skipped: list<string>}
     *
     * @throws ImportException when the file cannot be read, with a message for the researcher
     */
    public function import(User $user, UploadedFile $file, array $defaults = []): array
    {
        $content = ImportFile::text((string) file_get_contents($file->getRealPath()));
        $start = ltrim($content, " \t\n\r");
        $isXml = str_starts_with($start, '<');
        $skipped = [];

        if ($isXml) {
            $values = ApafisImport::convert(self::apafis($content));
            [$values, $untranslated] = $this->translate($values);
            $source = 'APAFiS';
        } elseif (str_starts_with($start, '{') || str_starts_with($start, '[')) {
            try {
                $json = json_decode($content, true, 512, JSON_THROW_ON_ERROR | JSON_INVALID_UTF8_SUBSTITUTE);
            } catch (\JsonException $error) {
                throw new ImportException("This looks like a PRIS export (.json), but it is damaged or incomplete and cannot be read ({$error->getMessage()}). Export the protocol from PRIS again and import the new file.");
            }
            if (! is_array($json)) {
                throw new ImportException('This JSON file holds no protocol. Export the protocol from PRIS again and import the new file.');
            }
            ['values' => $values, 'skipped' => $skipped] = PrisImport::read($json);
            $untranslated = 0;
            $source = 'PRIS';
        } else {
            $kind = self::looksLikeCsv($start) ? 'a spreadsheet or CSV file' : 'plain text';
            throw new ImportException("This file is $kind, not an export we can import. Use the PRIS export (.json) or the APAFiS project form (.xml).");
        }

        $values = array_filter(ProtocolSchema::cleanAnswers(Protocol::getValidKeys($values)), fn ($value) => $value !== null && $value !== '' && $value !== []);
        $values += $defaults;

        $protocol = DB::transaction(function () use ($user, $values, $source, $isXml) {
            $protocol = $user->protocols()->create(['status' => 'draft']);
            $protocol->addDetailsToDatabase($values);
            $log = ImportLog::firstOrNew(['protocol_id' => $protocol->id]);
            $log->type = $isXml ? 'fc3r' : 'pris';
            $log->save();
            ActivityLog::record($protocol, 'imported', ['source' => $source], $user);

            return $protocol;
        });

        return ['protocol' => $protocol, 'source' => $source, 'untranslated' => $untranslated, 'skipped' => $skipped];
    }

    /**
     * The XML of an APAFiS project form; other XML gets a message naming what it is.
     *
     * @throws ImportException
     */
    private static function apafis(string $xml): string
    {
        $previous = libxml_use_internal_errors(true);
        $root = simplexml_load_string($xml, \SimpleXMLElement::class, LIBXML_NONET);
        $error = libxml_get_last_error();
        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        if ($root === false) {
            $detail = $error ? ' ('.trim($error->message).', line '.$error->line.')' : '';
            throw new ImportException("This looks like an APAFiS form (.xml), but it is damaged or incomplete and cannot be read$detail. Download the form from APAFiS again and import the new file.");
        }
        if ($root->getName() !== 'Formulaire_Apafis') {
            throw new ImportException("This XML file is not an APAFiS project form (it starts with <{$root->getName()}> instead of <Formulaire_Apafis>). PRIS exports are .json files.");
        }

        return $xml;
    }

    private static function looksLikeCsv(string $text): bool
    {
        $line = strtok($text, "\r\n") ?: '';

        return substr_count($line, ';') >= 2 || substr_count($line, ',') >= 2 || substr_count($line, "\t") >= 2;
    }

    /** @return array{0: array<string, mixed>, 1: int} the values, and how many stayed French */
    private function translate(array $values): array
    {
        $failed = 0;
        foreach (ApafisImport::TRANSLATE as $key) {
            if (is_string($values[$key] ?? null) && trim($values[$key]) !== '') {
                $english = $this->translator->toEnglish($values[$key]);
                $english === null ? $failed++ : $values[$key] = $english;
            }
        }

        return [$values, $failed];
    }
}
