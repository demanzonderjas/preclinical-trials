<?php

namespace App\Services\Import;

use App\Models\ActivityLog;
use App\Models\ImportLog;
use App\Models\Protocol;
use App\Models\User;
use App\Services\Translator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

/**
 * Starts a new draft from a PRIS (.json) or APAFiS (.xml) file. Importing never touches an
 * existing protocol, so answers already typed are safe.
 */
class ProtocolImporter
{
    public function __construct(private Translator $translator) {}

    /**
     * @return array{protocol: Protocol, source: string, untranslated: int}
     *
     * @throws \InvalidArgumentException when the file is neither
     */
    public function import(User $user, UploadedFile $file, array $defaults = []): array
    {
        $content = (string) file_get_contents($file->getRealPath());
        $isXml = str_starts_with(ltrim($content, "\xEF\xBB\xBF \t\n\r"), '<');

        if ($isXml) {
            $values = ApafisImport::convert($content);
            [$values, $untranslated] = $this->translate($values);
            $source = 'APAFiS';
        } else {
            $json = json_decode($content, true);
            if (! is_array($json)) {
                throw new \InvalidArgumentException('Not a PRIS or APAFiS file.');
            }
            $values = PrisImport::convert($json);
            $untranslated = 0;
            $source = 'PRIS';
        }

        $values = array_filter(Protocol::getValidKeys($values), fn ($value) => $value !== null && $value !== '' && $value !== []);
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

        return ['protocol' => $protocol, 'source' => $source, 'untranslated' => $untranslated];
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
