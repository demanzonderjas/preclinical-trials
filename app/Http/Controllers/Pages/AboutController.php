<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Models\Ambassador;
use App\Services\PublicRegister;
use Inertia\Inertia;
use Inertia\Response;

class AboutController extends Controller
{
    public function __invoke(PublicRegister $register): Response
    {
        $figures = $register->figures();
        $perCountry = $register->summaries()->pluck('country')->filter()->countBy();
        $codes = array_flip(array_map('mb_strtolower', config('pct.countries')));

        $ambassadors = Ambassador::all()
            ->sortBy(fn (Ambassador $ambassador) => (float) $ambassador->longitude)
            ->values()
            ->map(function (Ambassador $ambassador, int $index) use ($perCountry, $codes) {
                [$city, $country] = array_pad(array_map('trim', explode(',', (string) $ambassador->geo_search, 2)), 2, null);
                $code = $country ? ($codes[mb_strtolower($country)] ?? self::alias($country)) : null;

                return [
                    'id' => $ambassador->id,
                    'number' => $index + 1,
                    'name' => $ambassador->name,
                    // Written by admins in the CMS; shown as plain text.
                    'description' => trim(html_entity_decode(strip_tags((string) $ambassador->description))),
                    'city' => $city,
                    'country' => $country,
                    'country_code' => $code,
                    'protocols_in_country' => $code ? $perCountry->get($code, 0) : null,
                    'lat' => (float) $ambassador->latitude,
                    'lng' => (float) $ambassador->longitude,
                ];
            });

        return Inertia::render('about', [
            'figures' => [
                'total' => $figures['total'],
                'countries' => $figures['countries'],
                'public' => $figures['public'],
                'registered_before_start' => $figures['registered_before_start'],
            ],
            'ambassadors' => $ambassadors,
        ]);
    }

    /** Country spellings in ambassador locations that differ from config('pct.countries'). */
    private static function alias(string $country): ?string
    {
        return [
            'uk' => 'GB',
            'united kingdom' => 'GB',
            'usa' => 'US',
            'united states' => 'US',
            'russia' => 'RU',
        ][mb_strtolower($country)] ?? null;
    }
}
