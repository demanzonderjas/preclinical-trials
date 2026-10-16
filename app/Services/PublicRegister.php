<?php

namespace App\Services;

use App\Models\Protocol;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

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
    public const CACHE_KEY = 'public-register:v1';

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
        $centre = collect($detail('study_centre') ?: [])->first();
        $countryCode = data_get($centre, 'country');
        $species = $detail('species');
        $status = $detail('study_status');
        $stage = $detail('study_stage');

        return [
            'id' => $protocol->id,
            'pct_id' => $protocol->pct_id,
            'title' => $protocol->title,
            'summary' => self::plainText($detail('hypothesis')),
            'study_status' => $status,
            'study_status_label' => $status ? __("pct.study_status.$status") : null,
            'study_stage' => $stage,
            'study_stage_label' => $stage ? __("pct.study_stage.$stage") : null,
            'species' => $species,
            'species_label' => $species === 'other' && $detail('other_species')
                ? ucfirst((string) $detail('other_species'))
                : ($species ? __("pct.species.$species") : null),
            'research_field' => $detail('research_field'),
            'centre_name' => data_get($centre, 'name'),
            'centre_city' => data_get($centre, 'city'),
            'country' => $countryCode,
            'country_name' => $countryCode ? (config("pct.countries.$countryCode") ?? $countryCode) : null,
            'start_date' => $start?->toDateString(),
            'end_date' => $end?->toDateString(),
            'period' => self::period($start, $end),
            'registered_at' => $registeredAt?->toIso8601String(),
            'registered_on' => $registeredAt?->format('j M Y'),
            'registered_year' => $registeredAt?->year,
            'registered_before_start' => self::registeredBeforeStart($registeredAt, $start),
        ];
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

        $countries = $public->pluck('country_name')->filter()->countBy()->sortDesc();
        $firstYear = $perYear->keys()->first();

        return [
            'total' => $published->count(),
            'public' => $public->count(),
            'under_embargo' => $underEmbargo,
            'first_year' => $firstYear,
            'registered_before_start' => $public->where('registered_before_start', true)->count(),
            'countries' => $countries->count(),
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
                    'label' => __("pct.species.$species"),
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

    private static function plainText(mixed $value): ?string
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        return trim(preg_replace('/\s+/', ' ', html_entity_decode(strip_tags($value))));
    }
}
