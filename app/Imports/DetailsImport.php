<?php

namespace App\Imports;

use App\Models\Detail;
use App\Models\Protocol;
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
            if (!empty($protocol)) {
                $fieldName = $this->convertFieldName($row);
                Detail::create([
                    'protocol_id' => $protocol->id,
                    'key' => $fieldName,
                    'value' => $this->convertFieldValue($fieldName, $row["fieldvalue"]),
                ]);
            }
        }
    }

    public function convertFieldValue($fieldName, $value)
    {
        switch ($fieldName) {
            case "randomisation":
            case "sex":
            case "randomisation":
            case "has_embargo":
            case "exclusive_animal_use":
            case "investigators_blinded_intervention":
            case "investigators_blinded_assessment":
                return strtolower($value);
            case "financial_support":
            case "intervention_type":
            case "study_status":
            case "species":
            case "randomisation_method_used":
            case "details_randomisation":
                return $this->slugify($value);
            case "study_stage":
                return $this->convertStudyStageValue($value);
            default:
                return $value;
        }
    }

    public function convertStudyStageValue($value)
    {
        $mappingTable = [
            "Stage 1 - Exploratory study (hypothesis generating)" => "study_stage_1_value",
            "Stage 2 - Confirmatory study (hypothesis testing)" => "study_stage_2_value",
        ];
        return $mappingTable[$value];
    }

    public function slugify($string)
    {
        return strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '_', $string)));
    }

    public function convertFieldName($row)
    {
        $mappingTable = [
            "TI" => "title",
            "CO" => $this->getContactKey($row),
            "SC" => "study_centre",
            "FU" => "financial_support",
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
            "AO" => "exclusive_animal_use",
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
            "SP" => "species",
            "SR" => "strain",
            "SX" => "sex",
            "TN" => "sum_of_animals",
            "EO" => "has_embargo"
        ];
        return $mappingTable[$row['fieldtag']];
    }

    public function getContactKey($row)
    {
        $mappingTable = [
            "contact_name",
            "contact_role",
            "contact_email"
        ];
        return $mappingTable[$row['subtag']];
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
        return $mappingTable[$row['subtag']];
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
            "why_no_randomisation",
            "randomisation_method_used",
            "other_randomisation_method",
            "details_randomisation"
        ];
        return $mappingTable[$row['subtag']];
    }

    public function getJustifyNumberOfAnimals($row)
    {
        $mappingTable = [
            "sample_size_calculation",
            "no_sample_size_calculation_details",
        ];
        return isset($mappingTable[$row['subtag']]) ? $mappingTable[$row['subtag']] : "";
    }
}
