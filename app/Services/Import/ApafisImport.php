<?php

namespace App\Services\Import;

use SimpleXMLElement;

/**
 * An APAFiS project form (.xml, French) as protocol answers. Ported from
 * resources/legacy/js/utils/fc3r.ts; the XML is read the way xml2js did with
 * explicitArray: false, so the same paths apply.
 */
class ApafisImport
{
    /** Answers that are French text and are translated after the import. */
    public const TRANSLATE = ['title', 'research_field', 'hypothesis', 'no_exclusive_animal_use_details', 'other_species', 'strain', 'experimental_design', 'sample_size_calculation_details', 'additional_information'];

    private const ADMIN = 'Formulaire_Apafis.InformationsAdministrativesEtReglementaires';

    private const SPECIES = [
        'Chats' => 'cat', 'Chiens' => 'dog', 'Furets' => 'ferret', 'Caprins' => 'goat', 'Cobayes' => 'guinea_pig',
        'HamstersSyriens' => 'hamster', 'HamstersChinois' => 'hamster', 'Chevaux' => 'horse', 'Souris' => 'mouse',
        'Prosimien' => 'monkey', 'Ouistitis' => 'monkey', 'SingeCynomologue' => 'monkey', 'SingeRhesus' => 'monkey',
        'Vervets' => 'monkey', 'Babouins' => 'monkey', 'Sairimis' => 'monkey', 'AutresSingesAncienMonde' => 'monkey',
        'AutresSingesNouveauMonde' => 'monkey', 'AutresPrimateNonHumain' => 'monkey', 'SingesAntropoides' => 'monkey',
        'Porcs' => 'pig', 'Lapins' => 'rabbit', 'Rats' => 'rat', 'Ovins' => 'sheep',
    ];

    /** @return array<string, mixed> */
    public static function convert(string $xml): array
    {
        $root = simplexml_load_string($xml, SimpleXMLElement::class, LIBXML_NONET);
        if ($root === false) {
            throw new \InvalidArgumentException('Not an XML file.');
        }
        $data = [$root->getName() => self::toArray($root)];
        $get = fn (string $path) => data_get($data, $path, '');

        $reused = $get(self::ADMIN.'.Animaux.OrigineAnimaux.AnimauxReutilisesProjetPrecedent');
        $animals = $get(self::ADMIN.'.Animaux.ListeAnimaux');
        $usedSpecies = is_array($animals) ? array_search('true', $animals, true) : false;
        $species = $usedSpecies === false ? '' : (self::SPECIES[$usedSpecies] ?? 'other');
        $sampleSize = $get(self::ADMIN.'.Animaux.AnimauxUtilises.JustificationUtilisationEspeces');
        $contact = $get(self::ADMIN.'.EtablissementUtilisateur.ResponsablesMiseEnOeuvre.CoordonneesResponsablesMiseEnOeuvre');
        $purposes = $get('Formulaire_Apafis.PublishNtsProjectRequest.projectPurposes.purpose');

        return [
            'title' => $get('Formulaire_Apafis.InformationsGenerales.TitreProjet'),
            'study_status' => 'not_started',
            'study_stage' => self::stage($get('Formulaire_Apafis.ProceduresExperimentales.ObjetsVises')),
            'research_field' => is_array($purposes) ? implode(', ', array_filter($purposes, 'is_string')) : (is_string($purposes) ? $purposes : ''),
            'hypothesis' => $get(self::ADMIN.'.Projet.DescriptionProjet2.ObjectifsDuProjet'),
            'exclusive_animal_use' => $reused === 'true' ? 'no' : 'yes',
            'no_exclusive_animal_use_details' => $reused === 'true' ? 'animals used in a previous project' : '',
            'species' => $species,
            'other_species' => $species === 'other' ? implode(' ', preg_split('/(?=[A-Z])/', $usedSpecies, -1, PREG_SPLIT_NO_EMPTY)) : '',
            'strain' => $get(self::ADMIN.'.Animaux.OrigineAnimaux.ElevesAFinExperimentale.OuiEleves.OuiElevesAFinExperimentale.AnimauxFournis'),
            'experimental_design' => $get(self::ADMIN.'.Projet.DescriptionProjet2.DerouleDuProjet'),
            'sample_size_calculation' => $sampleSize ? 'yes' : 'no',
            'sample_size_calculation_details' => $sampleSize,
            'sum_of_animals' => $get(self::ADMIN.'.Animaux.AnimauxUtilises.NombreAnimauxUtilises'),
            'original_animal_ethics_committee_application' => $get(self::ADMIN.'.EtablissementUtilisateur.AgrementUE.NumeroAgrement'),
            'additional_information' => collect([
                self::ADMIN.'.Animaux.PointsLimitesAdaptes',
                'Formulaire_Apafis.ProceduresExperimentales.ExplicationsProcedures.Procedure.DescriptionDetaillee.MethodeSuppressionDouleur',
                'Formulaire_Apafis.ProceduresExperimentales.ExplicationsProcedures.Procedure.DescriptionDetaillee.MethodeSuppressionSouffrance',
            ])->map($get)->filter(fn ($text) => is_string($text) && trim($text) !== '')->implode("\n\n"),
            'contact_email' => is_array($contact) ? (array_is_list($contact) ? data_get($contact, '0.Email') : data_get($contact, 'Email')) : '',
        ];
    }

    /** ObjetsVises points A, D–G mean exploratory and B–C confirmatory; mixed means unknown. */
    private static function stage(mixed $points): ?string
    {
        $points = is_array($points) ? $points : [];
        $is = fn (string $point) => ($points["Point$point"] ?? null) === 'true';
        $isNot = fn (string $point) => ($points["Point$point"] ?? null) === 'false';
        $all = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

        $exploratory = collect(['A', 'D', 'E', 'F', 'G'])->contains($is) || collect($all)->every($isNot);
        $confirmatory = collect(['B', 'C'])->contains($is) || collect($all)->every($is);

        return match (true) {
            $exploratory && ! $confirmatory => 'study_stage_1_value',
            $confirmatory && ! $exploratory => 'study_stage_2_value',
            default => null,
        };
    }

    /** Text for leaf elements, a map of children otherwise, a list for repeated names. */
    private static function toArray(SimpleXMLElement $element): array|string
    {
        if ($element->count() === 0) {
            return trim((string) $element);
        }

        $result = [];
        $repeated = [];
        foreach ($element->children() as $name => $child) {
            $value = self::toArray($child);
            if (! array_key_exists($name, $result)) {
                $result[$name] = $value;
            } elseif (isset($repeated[$name])) {
                $result[$name][] = $value;
            } else {
                $result[$name] = [$result[$name], $value];
                $repeated[$name] = true;
            }
        }

        return $result;
    }
}
