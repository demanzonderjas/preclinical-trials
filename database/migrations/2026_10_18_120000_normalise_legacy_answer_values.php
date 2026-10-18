<?php

use App\Services\PublicRegister;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

/**
 * Older answers spell some options differently from the current option values, e.g.
 * "completed_and_published_full-text" or "investigator driven". The register showed them as
 * raw translation keys and its filters split them from the current values. This rewrites them
 * to the current values. The version history keeps what was stored at the time.
 */
return new class extends Migration
{
    private const VALUES = [
        'study_status' => [
            'completed_and_published_full-text' => 'completed_and_published_full_text',
            'completed_and_published' => 'completed_and_published_full_text',
            'Not started' => 'not_started',
        ],
        'randomisation_method_used' => [
            'computer-generated_random_number_sequence' => 'computer_generated_random_number_sequence',
            'coin-toss' => 'coin_toss',
        ],
        'financial_support' => [
            'investigator driven' => 'investigator_driven',
            '_investigator_driven' => 'investigator_driven',
            '_grants' => 'grants',
        ],
        'intervention_type' => [
            'not applicable' => 'not_applicable',
        ],
        'placebo_controlled' => [
            'not applicable' => 'not_applicable',
        ],
        'species' => [
            'cats' => 'cat',
            'pigs' => 'pig',
        ],
    ];

    public function up(): void
    {
        $rows = DB::table('details')->whereIn('key', array_keys(self::VALUES))->get(['id', 'key', 'value']);

        foreach ($rows as $row) {
            $value = json_decode(Crypt::decryptString($row->value), true);
            $map = self::VALUES[$row->key];
            $normalised = is_array($value)
                ? array_values(array_unique(array_map(fn ($item) => is_string($item) ? ($map[$item] ?? $item) : $item, $value), SORT_REGULAR))
                : (is_string($value) ? ($map[$value] ?? $value) : $value);

            if ($normalised !== $value) {
                DB::table('details')->where('id', $row->id)->update(['value' => Crypt::encryptString(json_encode($normalised))]);
            }
        }

        PublicRegister::forget();
    }

    public function down(): void
    {
        // The old spellings meant the same options; restore the backup to get them back.
    }
};
