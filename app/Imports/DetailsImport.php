<?php

namespace App\Imports;

use App\Models\Detail;
use App\Models\Protocol;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class DetailsImport implements ToCollection, WithHeadingRow
{
    /**
     * @param Collection $collection
     */
    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            $protocol = Protocol::find($row["recordid"]);
            if (empty($protocol)) {
                continue;
            }
            $fieldName = $this->convertFieldName($row);
            if ($fieldName === null) {
                continue;
            }
            $value = $this->convertFieldValue($fieldName, $row["fieldvalue"]);
            if ($value === null) {
                continue;
            }
            $detail = Detail::firstOrNew([
                'protocol_id' => $protocol->id,
                'key' => $fieldName,
            ]);
            $detail->value = $value;
            $detail->save();
        }
    }

    public function convertFieldValue($fieldName, $value)
    {
        switch ($fieldName) {
            case "study_arms":
                return json_decode($value);
            case "study_centre":
                return $this->convertStudyCentre($value);
            case "investigators_blinded_intervention":
            case "investigators_blinded_assessment":
                return $this->slugify($value);
            case "randomisation":
            case "sex":
            case "randomisation":
            case "exclusive_animal_use":
            case "sample_size_calculation":
            case "placebo_controlled":
                return strtolower($value);
            case "intervention_type":
            case "study_status":
            case "species":
            case "randomisation_method_used":
            case "details_randomisation":
                return $this->slugify($value);
            case "study_stage":
                return $this->convertStudyStageValue($value);
            case "financial_support":
                return $this->convertFinancialSupport($value);
            case "has_embargo":
                return $this->convertEmbargo($value);
            case "start_date":
            case "end_date":
                return $this->convertDate($value);
            default:
                return $value;
        }
    }

    public function convertDate($value)
    {
        $dateWithoutDoubleSlashes = stripslashes($value);
        $dateWithHypens = str_replace("/", "-", $dateWithoutDoubleSlashes);
        try {
            $carbon = Carbon::create($dateWithHypens);
        } catch (Exception $e) {
            return "";
        }
        return $carbon->toDateString();
    }

    public function convertStudyCentre($value)
    {
        $studyCentreArray = json_decode($value);
        $countries = config('pct.countries');
        if (empty($studyCentreArray)) {
            return null;
        }
        foreach ($studyCentreArray as &$centre) {
            $matchingCountryCode = array_search($centre->country, $countries);
            $centre->country = $matchingCountryCode !== false ? $matchingCountryCode : "";
        }
        return $studyCentreArray;
    }

    public function convertEmbargo($value)
    {
        $mappingTable = [
            "Embargo" => "yes",
            "No Embargo" => "no",
            "No embargo" => "no"
        ];
        return $mappingTable[$value];
    }

    public function convertFinancialSupport($value)
    {
        $arrayOfValues = explode("//", $value);
        return array_map(function ($value) {
            return $this->slugify($value);
        }, $arrayOfValues);
    }

    public function convertStudyStageValue($value)
    {
        $mappingTable = [
            "Stage 1 - Exploratory study (hypothesis generating)" => "study_stage_1_value",
            "Stage 2 - Confirmatory study (hypothesis testing)" => "study_stage_2_value",
            "Stage 1 – Exploratory study (hypothesis generating)" => "study_stage_1_value",
            "Stage 2 – Confirmatory study (hypothesis testing)" => "study_stage_2_value"
        ];
        return $mappingTable[$value];
    }

    public function slugify($string)
    {
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '_', $string)));
        $lastCharUnderScore = substr($slug, -1) === "_";
        $firstCharUnderScore = substr($slug, 0, 1) === "_";
        if ($lastCharUnderScore) {
            return substr($slug, 0, strlen($slug) - 1);
        } else if ($firstCharUnderScore) {
            return substr($slug, 1);
        }
        return $slug;
    }

    public function convertFieldName($row)
    {
        $mappingTable = [
            "TI" => "title",
            "CO" => $this->getContactKey($row),
            "SC" => "study_centre",
            "FU" => $this->getFinancialSupportKey($row),
            "SD" => "start_date",
            "ED" => "end_date",
            "SS" => 'study_status',
            "FM" => "research_field",
            "HS" => "hypothesis",
            "HY" => "hypothesis",
            "IT" => $this->getInterventionKey($row),
            "SA" => "study_stage",
            "PE" => "primary_readout_parameter",
            "SE" => "secondary_readout_parameter",
            "AO" => $this->getExclusiveAnimalUseKey($row),
            "AM" => "experimental_design",
            "AR" => "short_title",
            "BA" => $this->getBlindedAssessmentKey($row),
            "BI" => $this->getBlindedAssessmentKey($row),
            "EC" => $this->getEthicsCommitteeApplicationKey($row),
            "GR" => "study_arms",
            "LP" => "link_to_data",
            "PE" => "primary_readout_parameter",
            "SE" => "secondary_readout_parameter",
            "PL" => "placebo_controlled",
            "RA" => $this->getRandomisationKey($row),
            "SI" => $this->getJustifyNumberOfAnimals($row),
            "SP" => $this->getSpeciesKey($row),
            "SR" => "strain",
            "SX" => "sex",
            "TN" => "sum_of_animals",
            "EO" => "has_embargo"
        ];
        $keyExists = array_key_exists($row['fieldtag'], $mappingTable);

        return $keyExists ? $mappingTable[$row['fieldtag']] : null;
    }

    public function getFinancialSupportKey($row)
    {
        $mappingTable = [
            "financial_support",
            "other_financial_support"
        ];
        return isset($mappingTable[$row['subtag']]) ? $mappingTable[$row['subtag']] : "";
    }

    public function getExclusiveAnimalUseKey($row)
    {
        $mappingTable = [
            "exclusive_animal_use",
            "no_exclusive_animal_use_details"
        ];
        return isset($mappingTable[$row['subtag']]) ? $mappingTable[$row['subtag']] : "";
    }

    public function getSpeciesKey($row)
    {
        $mappingTable = [
            "species",
            "other_species"
        ];
        return isset($mappingTable[$row['subtag']]) ? $mappingTable[$row['subtag']] : "";
    }

    public function getContactKey($row)
    {
        $mappingTable = [
            "contact_name",
            "contact_role",
            "contact_email"
        ];
        return isset($mappingTable[$row['subtag']]) ? $mappingTable[$row['subtag']] : "";
    }

    public function getInterventionKey($row)
    {
        $mappingTable = [
            "intervention_type",
            "other_intervention_type",
        ];
        return isset($mappingTable[$row['subtag']]) ? $mappingTable[$row['subtag']] : "";
    }

    public function getBlindedAssessmentKey($row)
    {
        $mappingTable = [
            "investigators_blinded_intervention",
            "yes_blinded_intervention_how_details",
            "yes_blinded_intervention_partially_details",
            "investigators_blinded_assessment",
            "yes_blinded_assessment_how_details",
            "yes_blinded_assessment_partially_details",
        ];
        return isset($mappingTable[$row['subtag']]) ? $mappingTable[$row['subtag']] : "";
    }

    public function getEthicsCommitteeApplicationKey($row)
    {
        $mappingTable = [
            "original_animal_ethics_committee_application",
            "application_number",
        ];
        return isset($mappingTable[$row['subtag']]) ? $mappingTable[$row['subtag']] : "";
    }

    public function getRandomisationKey($row)
    {
        $mappingTable = [
            "randomisation",
            "randomisation_method_used",
            "other_randomisation_method",
            "details_randomisation",
            "why_no_randomisation",
        ];
        return isset($mappingTable[$row['subtag']]) ? $mappingTable[$row['subtag']] : "";
    }

    public function getJustifyNumberOfAnimals($row)
    {
        $mappingTable = [
            "sample_size_calculation",
            "sample_size_calculation_details",
        ];
        return isset($mappingTable[$row['subtag']]) ? $mappingTable[$row['subtag']] : "";
    }
}
