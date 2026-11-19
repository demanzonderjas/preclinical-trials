<?php

namespace App\Http\Controllers\Pages;

use App\Content\PageContent;
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
                // Places saved by the legacy admin hold the city only ("Edmonton"); the admin form now
                // asks for "City, country". Until those places are re-saved, look the country up.
                if (! $country && $city && ($code = self::legacyCityCountry($city))) {
                    $country = config("pct.countries.$code");
                }

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
            // The texts, the team and the timelines: Admin → Content → Pages (app/Content/Pages/AboutPage.php).
            'content' => PageContent::for('about'),
            'figures' => [
                'total' => $figures['total'],
                'countries' => $figures['countries'],
                'public' => $figures['public'],
                'registered_before_start' => $figures['registered_before_start'],
            ],
            'ambassadors' => $ambassadors,
        ]);
    }

    /**
     * The country of the cities in ambassador places saved without a country by the legacy admin,
     * as ISO code. Places written as "City, country" do not need this.
     */
    private static function legacyCityCountry(string $city): ?string
    {
        return [
            'edmonton' => 'CA',
            'ottawa' => 'CA',
            'guadalajara' => 'MX',
            'louisville' => 'US',
            'edinburgh' => 'GB',
            'paris' => 'FR',
            'amsterdam' => 'NL',
            'utrecht' => 'NL',
            'amersfoort' => 'NL',
            'lund' => 'SE',
            'saint petersburg' => 'RU',
            'ain shams university' => 'EG',
            'surabaya' => 'ID',
        ][mb_strtolower($city)] ?? null;
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
