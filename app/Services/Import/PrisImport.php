<?php

namespace App\Services\Import;

use Carbon\Carbon;

/**
 * A PRIS export (.json) as protocol answers. Ported from the former SPA
 * (resources/legacy/js/utils/pris.ts, see git history); PRIS stores choices as indexes into the
 * legacy option lists below.
 *
 * Exports differ between PRIS versions and between the programs that saved them, so reading is
 * lenient: the protocol may sit under "content" (as the legacy importer expected) or another
 * wrapper, or at the top; names match whatever their case or separators (shortTitle,
 * short_title, ShortTitle) and a few other spellings; choices may be indexes, numbers as text
 * or words; one answer that cannot be read is skipped instead of failing the whole import.
 */
class PrisImport
{
    private const SUPPORT = ['industry', 'investigator_driven', 'grants', 'other'];

    private const BLINDING = ['no', 'yes', 'yes_partially'];

    private const INTERVENTION = ['not_applicable', 'compound', 'delivery_method', 'retention', 'model_optimalisation', 'surgery', 'device', 'other'];

    private const STAGE = ['study_stage_1_value', 'study_stage_2_value'];

    private const ARM = ['sham', 'control', 'intervention', 'other'];

    /** Other names seen for, or likely in older exports of, a PRIS field. Unverified guesses except the first name. */
    private const ALIASES = [
        'hypotheses' => ['hypothesis', 'researchQuestion'],
        'medicineFields' => ['medicineField', 'researchField', 'researchFields'],
        'studyCentres' => ['studyCentre', 'studyCenters', 'studyCenter'],
        'supportSources' => ['supportSource', 'sourcesOfSupport'],
        'groups' => ['studyArms', 'arms'],
        'strains' => ['strain'],
        'animalCount' => ['numberOfAnimals', 'totalAnimals'],
        'animalSex' => ['sex'],
        'shortTitle' => ['acronym'],
        'stage' => ['studyStage'],
    ];

    /** Wrappers the protocol may sit in. */
    private const WRAPPERS = ['content', 'protocol', 'data', 'record'];

    /** Species names (lower case) and the register's species. Anything else becomes "other". */
    private const SPECIES = [
        'mouse' => 'mouse', 'mice' => 'mouse', 'rat' => 'rat', 'rats' => 'rat',
        'pig' => 'pig', 'pigs' => 'pig', 'piglet' => 'pig', 'piglets' => 'pig', 'swine' => 'pig', 'porcine' => 'pig', 'minipig' => 'pig', 'minipigs' => 'pig',
        'sheep' => 'sheep', 'ovine' => 'sheep', 'lamb' => 'sheep', 'lambs' => 'sheep',
        'goat' => 'goat', 'goats' => 'goat', 'dog' => 'dog', 'dogs' => 'dog', 'canine' => 'dog',
        'cat' => 'cat', 'cats' => 'cat', 'feline' => 'cat', 'rabbit' => 'rabbit', 'rabbits' => 'rabbit',
        'hamster' => 'hamster', 'hamsters' => 'hamster', 'guinea pig' => 'guinea_pig', 'guinea pigs' => 'guinea_pig',
        'ferret' => 'ferret', 'ferrets' => 'ferret', 'horse' => 'horse', 'horses' => 'horse', 'pony' => 'horse', 'ponies' => 'horse',
        'monkey' => 'monkey', 'monkeys' => 'monkey', 'macaque' => 'monkey', 'macaques' => 'monkey', 'marmoset' => 'monkey', 'marmosets' => 'monkey',
        'primate' => 'monkey', 'primates' => 'monkey', 'non-human primate' => 'monkey', 'non-human primates' => 'monkey', 'nonhuman primates' => 'monkey',
    ];

    /** Labels of the answers, to say which ones were skipped. */
    private const LABELS = [
        'sex' => 'sex', 'species' => 'species', 'study_stage' => 'study stage', 'start_date' => 'start date', 'end_date' => 'end date',
        'study_arms' => 'study arms', 'strain' => 'strain', 'study_centre' => 'study centre', 'financial_support' => 'sources of support',
        'intervention_type' => 'intervention type', 'investigators_blinded_intervention' => 'blinding (intervention)',
        'investigators_blinded_assessment' => 'blinding (assessment)',
    ];

    /**
     * The answers only; see read() for what could not be read.
     *
     * @return array<string, mixed>
     */
    public static function convert(array $file): array
    {
        return self::read($file)['values'];
    }

    /**
     * @return array{values: array<string, mixed>, skipped: list<string>}
     *
     * @throws ImportException when the JSON holds no PRIS protocol
     */
    public static function read(array $file): array
    {
        $data = self::protocol($file);
        $get = fn (string $path) => self::get($data, $path);

        $answers = [
            'application_number' => fn () => self::text($get('animalCommittee.applicationNumber')),
            'sum_of_animals' => fn () => self::text($get('animalCount')),
            'sex' => fn () => self::sex($get('animalSex')),
            'investigators_blinded_intervention' => fn () => self::option(self::BLINDING, $get('blinding.investigator.selection') ?? $get('blinding.investigator')),
            'yes_blinded_intervention_how_details' => fn () => self::text($get('blinding.investigator.description')),
            'investigators_blinded_assessment' => fn () => self::option(self::BLINDING, $get('blinding.outcome.selection') ?? $get('blinding.outcome')),
            'yes_blinded_assessment_how_details' => fn () => self::text($get('blinding.outcome.description')),
            'contact_email' => fn () => self::text($get('contact.email')),
            'contact_name' => fn () => self::text($get('contact.name')),
            'contact_role' => fn () => self::text($get('contact.role')),
            'end_date' => fn () => self::date($get('date.end') ?? $get('endDate')),
            'start_date' => fn () => self::date($get('date.start') ?? $get('startDate')),
            'primary_readout_parameter' => fn () => self::text($get('endpoints.primary')),
            'secondary_readout_parameter' => fn () => self::text($get('endpoints.secondary')),
            'study_arms' => fn () => self::arms($get('groups')),
            'hypothesis' => fn () => self::text($get('hypotheses')),
            'other_intervention_type' => fn () => self::text($get('interventionType.description')),
            'intervention_type' => fn () => self::options(self::INTERVENTION, $get('interventionType.selection') ?? $get('interventionType')),
            'research_field' => fn () => self::text($get('medicineFields')),
            'placebo_controlled' => fn () => self::yesNo($get('placeboArms'), [0 => 'no']),
            'randomisation' => fn () => self::yesNo($get('randomisation.selection') ?? $get('randomisation'), [0 => 'no', 1 => 'yes']),
            'why_no_randomisation' => fn () => self::text($get('randomisation.description')),
            // PRIS asks whether animals are reused; the register asks whether their use is exclusive.
            'exclusive_animal_use' => fn () => self::invert(self::yesNo($get('reuseAnimals.selection') ?? $get('reuseAnimals'), [0 => 'no', 1 => 'yes'])),
            'sample_size_calculation' => fn () => self::yesNo($get('sampleSize.selection') ?? $get('sampleSize'), [0 => 'yes', 1 => 'no']),
            'sample_size_calculation_details' => fn () => self::text($get('sampleSize.description')),
            'short_title' => fn () => self::text($get('shortTitle')),
            'study_stage' => fn () => self::stage($get('stage')),
            'strain' => fn () => self::strains($get('strains')),
            'study_centre' => fn () => self::centres($get('studyCentres')),
            'financial_support' => fn () => self::options(self::SUPPORT, $get('supportSources.selection') ?? $get('supportSources')),
            'title' => fn () => self::text($get('title')),
        ];

        $values = [];
        $skipped = [];
        foreach ($answers as $key => $answer) {
            try {
                $values[$key] = $answer();
            } catch (\Throwable) {
                $values[$key] = null;
                $skipped[] = self::LABELS[$key] ?? str_replace('_', ' ', $key);
            }
        }

        // Species gives two answers: a register species, or "other" with its name.
        try {
            [$values['species'], $values['other_species']] = self::species($get('species'));
        } catch (\Throwable) {
            $skipped[] = 'species';
        }

        return ['values' => $values, 'skipped' => $skipped];
    }

    /**
     * The protocol object in the file: under "content" (PRIS), another wrapper, the first item
     * of a list, or the file itself.
     *
     * @throws ImportException
     */
    private static function protocol(array $file, int $depth = 0): array
    {
        if (array_is_list($file) && $file !== []) {
            $first = collect($file)->first(fn ($item) => is_array($item));
            if (is_array($first) && $depth < 4) {
                return self::protocol($first, $depth + 1);
            }
        }
        if (! self::looksLikePris($file) && $depth < 4) {
            foreach (self::WRAPPERS as $wrapper) {
                $inner = self::get($file, $wrapper);
                // Some systems store the protocol as JSON text inside the export.
                if (is_string($inner) && str_starts_with(ltrim($inner), '{')) {
                    $inner = json_decode($inner, true);
                }
                if (is_array($inner)) {
                    return self::protocol($inner, $depth + 1);
                }
            }
        }
        if (! self::looksLikePris($file)) {
            $found = implode(', ', array_slice(array_map('strval', array_keys($file)), 0, 8));
            throw new ImportException('This JSON file is not a PRIS protocol export: it has none of the PRIS fields (such as title, hypotheses or animalCount)'.($found !== '' ? ", only: $found." : '.'));
        }

        return $file;
    }

    private static function looksLikePris(array $data): bool
    {
        $known = ['title', 'shorttitle', 'hypotheses', 'animalcount', 'animalsex', 'species', 'strains', 'groups', 'stage', 'endpoints', 'studycentres', 'supportsources', 'medicinefields', 'randomisation', 'blinding', 'samplesize', 'reuseanimals', 'interventiontype', 'placeboarms', 'animalcommittee'];
        foreach (self::ALIASES as $aliases) {
            $known = [...$known, ...array_map(self::name(...), $aliases)];
        }
        $present = array_intersect(array_map(fn ($key) => self::name((string) $key), array_keys($data)), $known);

        return in_array('title', $present, true) || count($present) >= 2;
    }

    /**
     * A value by its dotted path, matching names whatever their case or separators, and the
     * aliases of a name. Null when it is not there.
     */
    private static function get(mixed $data, string $path): mixed
    {
        foreach (explode('.', $path) as $segment) {
            if (! is_array($data)) {
                return null;
            }
            $names = array_map(self::name(...), [$segment, ...(self::ALIASES[$segment] ?? [])]);
            $found = null;
            foreach ($names as $name) {
                foreach ($data as $key => $value) {
                    if (self::name((string) $key) === $name) {
                        $found = ['value' => $value];
                        break 2;
                    }
                }
            }
            if ($found === null) {
                return null;
            }
            $data = $found['value'];
        }

        return $data;
    }

    private static function name(string $key): string
    {
        return strtolower(preg_replace('/[\s_\-]+/', '', $key));
    }

    /** Text from a string, a number, or a list of either (or of {description|name|label}). */
    private static function text(mixed $value): ?string
    {
        if (is_string($value)) {
            return trim($value) === '' ? null : trim($value);
        }
        if (is_int($value) || is_float($value)) {
            return (string) $value;
        }
        if (is_array($value)) {
            $parts = array_map(function ($item) {
                if (is_array($item)) {
                    $item = self::get($item, 'description') ?? self::get($item, 'name') ?? self::get($item, 'label') ?? self::get($item, 'value');
                }

                return is_scalar($item) && ! is_bool($item) ? trim((string) $item) : '';
            }, array_is_list($value) ? $value : [$value]);
            $text = implode(', ', array_filter($parts, fn ($part) => $part !== ''));

            return $text === '' ? null : $text;
        }

        return null;
    }

    /** An option by its index (a number, or a number as text), its value, or {selection}. */
    private static function option(array $options, mixed $value): ?string
    {
        if (is_array($value) && ! array_is_list($value)) {
            $value = self::get($value, 'selection');
        }
        if (is_array($value)) {
            $value = $value[0] ?? null;
        }
        if (is_int($value) || (is_string($value) && ctype_digit(trim($value)))) {
            return $options[(int) $value] ?? null;
        }
        if (is_string($value) && trim($value) !== '') {
            $wanted = str_replace([' ', '-'], '_', strtolower(trim($value)));

            return in_array($wanted, $options, true) ? $wanted : null;
        }

        return null;
    }

    /** @return list<string> */
    private static function options(array $options, mixed $value): array
    {
        if (is_array($value) && ! array_is_list($value)) {
            $value = self::get($value, 'selection');
        }

        return array_values(array_unique(array_filter(array_map(fn ($item) => self::option($options, $item), is_array($value) ? $value : [$value]))));
    }

    /**
     * "yes" or "no" from a PRIS selection index (mapped by $indexes), a boolean, or a word.
     * A count above zero (placeboArms: 2) is "yes".
     *
     * @param  array<int, string>  $indexes
     */
    private static function yesNo(mixed $value, array $indexes): ?string
    {
        if (is_bool($value)) {
            return $value ? 'yes' : 'no';
        }
        if (is_int($value) || (is_string($value) && ctype_digit(trim($value)))) {
            return $indexes[(int) $value] ?? ((int) $value > 0 ? 'yes' : null);
        }
        if (is_string($value)) {
            return match (strtolower(trim($value))) {
                'yes', 'y', 'true', 'ja', 'j' => 'yes',
                'no', 'n', 'false', 'nee' => 'no',
                default => null,
            };
        }

        return null;
    }

    private static function invert(?string $yesNo): ?string
    {
        return ['yes' => 'no', 'no' => 'yes'][$yesNo] ?? null;
    }

    private static function sex(mixed $value): ?string
    {
        $value = self::text($value);
        if ($value === null) {
            return null;
        }

        return match (strtolower($value)) {
            'm', 'male', 'males' => 'male',
            'f', 'female', 'females' => 'female',
            'b', 'both', 'mixed', 'm/f', 'm+f', 'male and female', 'males and females' => 'both',
            default => null,
        };
    }

    private static function stage(mixed $value): ?string
    {
        $text = is_string($value) ? strtolower(trim($value)) : '';
        if (str_contains($text, 'explorat')) {
            return self::STAGE[0];
        }
        if (str_contains($text, 'confirmat')) {
            return self::STAGE[1];
        }

        return self::option(self::STAGE, $value);
    }

    /** @return array{0: ?string, 1: ?string} the species, and the name of another species */
    private static function species(mixed $value): array
    {
        if (is_array($value) && ! array_is_list($value)) {
            $value = self::get($value, 'description') ?? self::get($value, 'name') ?? self::get($value, 'label');
        }
        $name = self::text($value);
        if ($name === null) {
            return [null, null];
        }
        $species = self::SPECIES[strtolower($name)] ?? null;

        return $species ? [$species, null] : ['other', $name];
    }

    /**
     * A date as Y-m-d: ISO 8601, 2027-04-01, 01-04-2027 / 01/04/2027 / 01.04.2027 (day first, as
     * in Europe) or a Unix time in seconds or milliseconds.
     */
    private static function date(mixed $value): ?string
    {
        if (is_int($value) || is_float($value) || (is_string($value) && preg_match('/^\d{9,13}$/', trim($value)))) {
            $seconds = (float) $value > 1e11 ? (float) $value / 1000 : (float) $value;

            return Carbon::createFromTimestampUTC((int) $seconds)->toDateString();
        }
        if (! is_string($value) || trim($value) === '') {
            return null;
        }
        $value = trim($value);
        if (preg_match('/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/', $value, $match)) {
            return checkdate((int) $match[2], (int) $match[1], (int) $match[3])
                ? sprintf('%04d-%02d-%02d', $match[3], $match[2], $match[1])
                : throw new \UnexpectedValueException("Not a date: $value");
        }

        return Carbon::parse($value)->toDateString();
    }

    /** @return list<array{type: ?string, intervention: ?string, number: int|string|null}> */
    private static function arms(mixed $groups): array
    {
        if (! is_array($groups)) {
            return [];
        }

        return array_values(array_map(fn ($arm) => [
            // As in the legacy importer, an arm without a type is the first option.
            'type' => self::option(self::ARM, self::get($arm, 'type.selection') ?? self::get($arm, 'type')) ?? self::ARM[0],
            'intervention' => self::text(self::get($arm, 'name') ?? self::get($arm, 'description')),
            'number' => is_numeric(self::get($arm, 'count')) ? (int) self::get($arm, 'count') : self::text(self::get($arm, 'count')),
        ], array_filter(array_is_list($groups) ? $groups : [$groups], 'is_array')));
    }

    private static function strains(mixed $strains): ?string
    {
        if (! is_array($strains)) {
            return self::text($strains);
        }
        $text = collect(array_is_list($strains) ? $strains : [$strains])
            ->map(fn ($strain) => is_array($strain)
                ? implode(' - ', array_filter(array_map(fn ($key) => self::text(self::get($strain, $key)), ['description', 'supplier', 'speciesCode'])))
                : self::text($strain))
            ->filter()->implode('; ');

        return $text === '' ? null : $text;
    }

    /** @return list<array{name: ?string, city: string, country: ?string}> */
    private static function centres(mixed $centres): array
    {
        if (! is_array($centres)) {
            return [];
        }
        $countries = config('pct.countries', []);

        return array_values(array_filter(array_map(function ($centre) use ($countries) {
            $country = self::text(self::get($centre, 'country'));
            if ($country !== null && ! isset($countries[strtoupper($country)])) {
                // A country name instead of its code.
                $code = array_search(strtolower($country), array_map('strtolower', $countries), true);
                $country = $code === false ? null : $code;
            }

            return [
                'name' => self::text(self::get($centre, 'name')),
                'city' => self::text(self::get($centre, 'city')) ?? '',
                'country' => $country !== null ? strtoupper($country) : null,
            ];
        }, array_filter(array_is_list($centres) ? $centres : [$centres], 'is_array')), fn ($centre) => $centre['name'] || $centre['city'] || $centre['country']));
    }
}
