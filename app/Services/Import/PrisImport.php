<?php

namespace App\Services\Import;

use Carbon\Carbon;

/**
 * A PRIS export (.json) as protocol answers. Ported from resources/legacy/js/utils/pris.ts;
 * PRIS stores choices as indexes into the legacy option lists below.
 */
class PrisImport
{
    private const SUPPORT = ['industry', 'investigator_driven', 'grants', 'other'];

    private const BLINDING = ['no', 'yes', 'yes_partially'];

    private const INTERVENTION = ['not_applicable', 'compound', 'delivery_method', 'retention', 'model_optimalisation', 'surgery', 'device', 'other'];

    private const STAGE = ['study_stage_1_value', 'study_stage_2_value'];

    private const ARM = ['sham', 'control', 'intervention', 'other'];

    /** @return array<string, mixed> */
    public static function convert(array $file): array
    {
        $data = $file['content'] ?? $file;
        $get = fn (string $path) => data_get($data, $path, '');
        $index = fn (array $options, $value) => is_numeric($value) ? ($options[(int) $value] ?? null) : null;

        return [
            'application_number' => $get('animalCommittee.applicationNumber'),
            'sum_of_animals' => $get('animalCount'),
            'sex' => ['M' => 'male', 'F' => 'female', 'B' => 'both'][$get('animalSex')] ?? '',
            'investigators_blinded_intervention' => $index(self::BLINDING, $get('blinding.investigator.selection')),
            'yes_blinded_intervention_how_details' => $get('blinding.investigator.description'),
            'investigators_blinded_assessment' => $index(self::BLINDING, $get('blinding.outcome.selection')),
            'yes_blinded_assessment_how_details' => $get('blinding.outcome.description'),
            'contact_email' => $get('contact.email'),
            'contact_name' => $get('contact.name'),
            'contact_role' => $get('contact.role'),
            'end_date' => self::date($get('date.end')),
            'start_date' => self::date($get('date.start')),
            'primary_readout_parameter' => $get('endpoints.primary'),
            'secondary_readout_parameter' => $get('endpoints.secondary'),
            'study_arms' => collect(is_array($get('groups')) ? $get('groups') : [])->map(fn ($arm) => [
                'type' => self::ARM[data_get($arm, 'type.selection')] ?? self::ARM[0],
                'intervention' => data_get($arm, 'name'),
                'number' => data_get($arm, 'count'),
            ])->all(),
            'hypothesis' => $get('hypotheses'),
            'other_intervention_type' => $get('interventionType.description'),
            'intervention_type' => array_filter([$index(self::INTERVENTION, $get('interventionType.selection'))]),
            'research_field' => $get('medicineFields'),
            'placebo_controlled' => $get('placeboArms') ? 'yes' : 'no',
            'randomisation' => $get('randomisation.selection') === 1 ? 'yes' : 'no',
            'why_no_randomisation' => $get('randomisation.description'),
            'exclusive_animal_use' => $get('reuseAnimals.selection') === 1 ? 'no' : 'yes',
            'sample_size_calculation' => $get('sampleSize.selection') === 1 ? 'no' : 'yes',
            'sample_size_calculation_details' => $get('sampleSize.description'),
            'short_title' => $get('shortTitle'),
            'species' => ['Mice' => 'mouse'][data_get($data, 'species.description')] ?? '',
            'study_stage' => $index(self::STAGE, $get('stage')),
            'strain' => collect(is_array($get('strains')) ? $get('strains') : [])
                ->map(fn ($strain) => implode(' - ', array_filter([data_get($strain, 'description'), data_get($strain, 'supplier'), data_get($strain, 'speciesCode')])))
                ->filter()->implode('; '),
            'study_centre' => is_array($get('studyCentres')) ? [[
                'name' => data_get($data, 'studyCentres.name'),
                'city' => data_get($data, 'studyCentres.city') ?: '',
                'country' => data_get($data, 'studyCentres.country'),
            ]] : [],
            'financial_support' => collect(is_array($get('supportSources.selection')) ? $get('supportSources.selection') : [])
                ->map(fn ($i) => self::SUPPORT[$i] ?? null)->filter()->values()->all(),
            'title' => $get('title'),
        ];
    }

    private static function date(mixed $value): string
    {
        if (! is_string($value) || $value === '') {
            return '';
        }

        try {
            return Carbon::parse($value)->toDateString();
        } catch (\Throwable) {
            return '';
        }
    }
}
