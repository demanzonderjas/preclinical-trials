<?php

namespace App\Services;

use App\Models\Protocol;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Lang;

/**
 * Read model of the public register: published protocols without embargo, as display-ready
 * summaries, plus the figures shown on the home page and in the statistics.
 *
 * Protocol details are encrypted at rest, so filtering happens in PHP on decrypted
 * summaries. They are cached and the cache is flushed whenever a protocol, its details or
 * its admin actions change (see App\Models\Protocol::booted).
 */
class PublicRegister
{
    public const CACHE_KEY = 'public-register:v4';

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function summaries(): Collection
    {
        return collect(Cache::rememberForever(self::CACHE_KEY, function () {
            return Protocol::where('status', 'published')
                ->with('details', 'adminActions', 'embargoEndDates')
                ->get()
                ->reject(fn (Protocol $protocol) => $protocol->has_embargo)
                ->map(fn (Protocol $protocol) => self::summarize($protocol))
                ->sortByDesc('registered_at')
                ->values()
                ->all();
        }));
    }

    /**
     * A summary without the server-side search texts.
     *
     * @param  array<string, mixed>  $summary
     * @return array<string, mixed>
     */
    public static function forClient(array $summary): array
    {
        unset($summary['search']);

        return $summary;
    }

    public static function forget(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    /**
     * @return array<string, mixed>
     */
    public static function summarize(Protocol $protocol): array
    {
        $detail = fn (string $key) => optional($protocol->details->firstWhere('key', $key))->value;

        $registeredAt = $protocol->registration_date ? Carbon::parse($protocol->registration_date) : null;
        $start = self::date($detail('start_date'));
        $end = self::date($detail('end_date'));
        $centres = self::centres($detail('study_centre'));
        $centre = $centres[0] ?? null;
        $countryCode = $centre['country'] ?? null;
        $species = $detail('species');
        $status = $detail('study_status');
        $stage = $detail('study_stage');

        return [
            'id' => $protocol->id,
            'pct_id' => $protocol->pct_id,
            'title' => $protocol->title,
            'summary' => self::plainText($detail('hypothesis')),
            'study_status' => $status,
            'study_status_label' => $status ? self::option('study_status', $status) : null,
            'study_stage' => $stage,
            'study_stage_label' => $stage ? self::option('study_stage', $stage) : null,
            'species' => $species,
            'species_label' => $species === 'other' && $detail('other_species')
                ? ucfirst((string) $detail('other_species'))
                : ($species ? self::option('species', $species) : null),
            'research_field' => self::plainText($detail('research_field')),
            // The first centre, as before; `centres` lists every one of them.
            'centre_name' => $centre['name'] ?? null,
            'centre_city' => $centre['city'] ?? null,
            'country' => $countryCode,
            'country_name' => $centre['country_name'] ?? null,
            'centres' => $centres,
            'start_date' => $start?->toDateString(),
            'end_date' => $end?->toDateString(),
            'period' => self::period($start, $end),
            'registered_at' => $registeredAt?->toIso8601String(),
            'registered_on' => $registeredAt?->format('j M Y'),
            'registered_year' => $registeredAt?->year,
            'registered_before_start' => self::registeredBeforeStart($registeredAt, $start),
            'sex' => $detail('sex'),
            'financial_support' => array_values(array_filter((array) ($detail('financial_support') ?: []), 'is_string')),
            'intervention_type' => $detail('intervention_type'),
            // Server-side only: the texts the database search looks in, per field.
            'search' => [
                'title' => (string) $protocol->title,
                'hypothesis' => (string) self::plainText($detail('hypothesis')),
                'research_field' => (string) self::plainText($detail('research_field')),
                'centre' => collect($centres)->map(fn (array $centre) => implode(' ', array_filter([$centre['name'], $centre['city'], $centre['country'] ? config("pct.countries.{$centre['country']}") : null])))->implode(' '),
                'pct_id' => (string) $protocol->pct_id,
                'other' => implode(' ', array_filter([
                    $species ? self::option('species', $species) : null,
                    (string) $detail('other_species'),
                    (string) $detail('strain'),
                    self::plainText($detail('primary_readout_parameter')),
                    self::plainText($detail('secondary_readout_parameter')),
                    self::plainText($detail('experimental_design')),
                ])),
            ],
        ];
    }

    /**
     * The study centres of a protocol, without empty rows. Older rows hold escaped
     * characters (&amp;). Stored as a list of {name, city, country}, as the form saves it.
     *
     * @return list<array{name: ?string, city: ?string, country: ?string, country_name: ?string}>
     */
    public static function centres(mixed $value): array
    {
        $text = function (mixed $value): ?string {
            $text = is_scalar($value) ? trim(html_entity_decode((string) $value, ENT_QUOTES | ENT_HTML5)) : '';

            return $text === '' ? null : $text;
        };

        // A single centre, or a list stored as an object keyed "0", "1"…
        if (is_object($value)) {
            $value = (array) $value;
        }
        if (is_array($value) && (array_key_exists('name', $value) || array_key_exists('city', $value) || array_key_exists('country', $value))) {
            $value = [$value];
        }

        return collect(is_array($value) ? array_values($value) : [])
            ->map(function ($centre) use ($text) {
                $country = $text(data_get($centre, 'country'));

                return [
                    'name' => $text(data_get($centre, 'name')),
                    'city' => $text(data_get($centre, 'city')),
                    'country' => $country,
                    'country_name' => $country ? (config("pct.countries.$country") ?? $country) : null,
                ];
            })
            ->filter(fn (array $centre) => $centre['name'] || $centre['city'] || $centre['country'])
            ->values()
            ->all();
    }

    /**
     * The centres as one line: "UMC Utrecht, Utrecht, Netherlands; Charité, Berlin, Germany".
     *
     * @param  list<array<string, ?string>>  $centres
     * @param  callable(array<string, ?string>): string|null  $format  one centre as text
     */
    public static function centreLine(array $centres, ?callable $format = null): ?string
    {
        $format ??= fn (array $centre) => implode(', ', array_filter([$centre['name'], $centre['city'], $centre['country_name']]));

        return collect($centres)->map($format)->filter()->implode('; ') ?: null;
    }

    /**
     * A protocol counts as registered before the study started when its date of registration
     * (approval) lies before the study start date.
     */
    public static function registeredBeforeStart(?Carbon $registeredAt, ?Carbon $start): bool
    {
        return $registeredAt !== null && $start !== null && $registeredAt->copy()->startOfDay()->lt($start->copy()->startOfDay());
    }

    /**
     * Figures for "The register at a glance" and the admin statistics.
     *
     * @return array<string, mixed>
     */
    public function figures(): array
    {
        $public = $this->summaries();
        $published = Protocol::where('status', 'published')->with('details')->get();
        $underEmbargo = $published->filter(fn (Protocol $protocol) => $protocol->has_embargo)->count();

        $perYear = $public->whereNotNull('registered_year')->countBy('registered_year')->sortKeys();
        if ($perYear->isNotEmpty()) {
            $perYear = collect(range($perYear->keys()->min(), max($perYear->keys()->max(), now()->year)))
                ->mapWithKeys(fn (int $year) => [$year => $perYear->get($year, 0)]);
        }

        // Named countries come from public protocols only, so an embargoed study is never shown by name.
        $countries = $public->pluck('country_name')->filter()->countBy()->sortDesc();
        // The count includes embargoed protocols (first centre, as for public ones): it only says how many
        // countries, never which, so it reveals nothing about an embargoed study.
        $allCountries = $published
            ->map(fn (Protocol $protocol) => self::centres(optional($protocol->details->firstWhere('key', 'study_centre'))->value)[0]['country'] ?? null)
            ->filter()
            ->unique();
        $firstYear = $perYear->keys()->first();

        return [
            'total' => $published->count(),
            'public' => $public->count(),
            'under_embargo' => $underEmbargo,
            'first_year' => $firstYear,
            'registered_before_start' => $public->where('registered_before_start', true)->count(),
            'countries' => $allCountries->count(),
            'top_countries' => $countries->keys()->take(2)->values()->all(),
            'per_year' => $perYear->map(fn (int $count, int $year) => ['year' => $year, 'count' => $count])->values()->all(),
            'stages' => [
                'confirmatory' => $public->where('study_stage', 'study_stage_2_value')->count(),
                'exploratory' => $public->where('study_stage', 'study_stage_1_value')->count(),
            ],
            'species' => $public->whereNotNull('species')
                ->groupBy('species')
                ->map(fn (Collection $group, string $species) => [
                    'species' => $species,
                    'label' => self::option('species', $species),
                    'count' => $group->count(),
                ])
                ->sortByDesc('count')
                ->values()
                ->all(),
        ];
    }

    private static function date(mixed $value): ?Carbon
    {
        if (! is_string($value) || $value === '') {
            return null;
        }

        try {
            return Carbon::parse($value);
        } catch (\Throwable) {
            return null;
        }
    }

    private static function period(?Carbon $start, ?Carbon $end): ?string
    {
        if (! $start && ! $end) {
            return null;
        }

        return trim(($start?->format('M Y') ?? '…').' – '.($end?->format('M Y') ?? '…'));
    }

    /**
     * The label of a stored option value, e.g. option('study_status', 'active'). A value without
     * a label is shown readable instead of as a translation key.
     */
    public static function option(string $group, string $value): string
    {
        return Lang::has("pct.$group.$value") ? __("pct.$group.$value") : ProtocolSchema::readable($value);
    }

    private static function plainText(mixed $value): ?string
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        return trim(preg_replace('/\s+/u', ' ', ProtocolSchema::plainText($value)));
    }
}
