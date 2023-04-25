import { TFormFieldName } from "../typings/forms";
import { TPRISConversion } from "../typings/protocols";
import { getNestedValue } from "./pris";

export function convertFC3RtoKeyValuePairs(data: any) {
	const PRISfields: TPRISConversion[] = [
		{
			value: "Formulaire_Apafis.InformationsGenerales.TitreProjet",
			target: TFormFieldName.Title
		},
		{
			value: "Formulaire_Apafis.ProceduresExperimentales.ObjetsVises",
			target: TFormFieldName.StudyStage,
			conversion: convertStudyStage
		},
		{
			value: "Formulaire_Apafis.PublishNtsProjectRequest.projectPurposes.purpose",
			target: TFormFieldName.ResearchField,
			conversion: convertResearchField
		},
		{
			value: "Formulaire_Apafis.InformationsAdministrativesEtReglementaires.Projet.DescriptionProjet2.ObjectifsDuProjet",
			target: TFormFieldName.Hypothesis
		},
		{
			value: "Formulaire_Apafis.InformationsAdministrativesEtReglementaires.Animaux.OrigineAnimaux.AnimauxReutilisesProjetPrecedent",
			target: TFormFieldName.ExclusiveAnimalUse,
			conversion: convertExclusiveAnimalUse
		},
		{
			value: "Formulaire_Apafis.InformationsAdministrativesEtReglementaires.Animaux.OrigineAnimaux.AnimauxReutilisesProjetPrecedent",
			target: TFormFieldName.NoExclusiveAnimalUseDetails,
			conversion: convertExclusiveAnimalUseDetails
		}
	];

	return PRISfields.reduce((base, next) => {
		const value = getNestedValue(next.value, data);
		base[next.target] = next.conversion ? next.conversion(value) : value;
		return base;
	}, {});
}

function convertStudyStage(object: object) {

	const prefix = "Point";
	const exploratory = ["A","D", "E", "F", "G"];
	const confirmatory = ["B","C"]

	const isExploratory = exploratory.some((point) => object[`${prefix}${point}`] === "true");
	const isConfirmatory = confirmatory.some((point) => object[`${prefix}${point}`] === "true");

	if((isExploratory && isConfirmatory) || (!isExploratory && !isConfirmatory)) {
		return null;
	} else if(isExploratory) {
		return "study_stage_1_value"
	} else if(isConfirmatory) {
		return "study_stage_2_value"
	} else {
		return null;
	}

}

function convertResearchField(purposes: string[]) {
	return purposes.join(", ");
}

function convertExclusiveAnimalUse(wasReused: string) {
	if(wasReused === "true") {
		return "no";
	} else {
		return "yes";
	}
}

function convertExclusiveAnimalUseDetails(wasReused: string) {
	if(wasReused === "true") {
		return "animals used in a previous project";
	}  else {
		return null;
	}
}