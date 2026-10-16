import { TFormFieldName } from "../typings/forms";
import { TFC3RConversion } from "../typings/protocols";
import { getNestedValue } from "./pris";

export const FC3Rfields: TFC3RConversion[] = [
	{
		value: "Formulaire_Apafis.InformationsGenerales.TitreProjet",
		target: TFormFieldName.Title,
		needsTranslation: true
	},
	{
		value: "Formulaire_Apafis.ProceduresExperimentales.ObjetsVises",
		target: TFormFieldName.StudyStage,
		conversion: convertStudyStage
	},
	{
		value: "Formulaire_Apafis.PublishNtsProjectRequest.projectPurposes.purpose",
		target: TFormFieldName.ResearchField,
		conversion: convertResearchField,
		needsTranslation: true
	},
	{
		value:
			"Formulaire_Apafis.InformationsAdministrativesEtReglementaires.Projet.DescriptionProjet2.ObjectifsDuProjet",
		target: TFormFieldName.Hypothesis,
		needsTranslation: true
	},
	{
		value:
			"Formulaire_Apafis.InformationsAdministrativesEtReglementaires.Animaux.OrigineAnimaux.AnimauxReutilisesProjetPrecedent",
		target: TFormFieldName.ExclusiveAnimalUse,
		conversion: convertExclusiveAnimalUse
	},
	{
		value:
			"Formulaire_Apafis.InformationsAdministrativesEtReglementaires.Animaux.OrigineAnimaux.AnimauxReutilisesProjetPrecedent",
		target: TFormFieldName.NoExclusiveAnimalUseDetails,
		conversion: convertExclusiveAnimalUseDetails,
		needsTranslation: true
	},
	{
		value: "Formulaire_Apafis.InformationsAdministrativesEtReglementaires.Animaux.ListeAnimaux",
		target: TFormFieldName.Species,
		conversion: convertSpecies
	},
	{
		value: "Formulaire_Apafis.InformationsAdministrativesEtReglementaires.Animaux.ListeAnimaux",
		target: TFormFieldName.OtherSpecies,
		conversion: convertOtherSpecies,
		needsTranslation: true
	},
	{
		value:
			"Formulaire_Apafis.InformationsAdministrativesEtReglementaires.Animaux.OrigineAnimaux.ElevesAFinExperimentale.OuiEleves.OuiElevesAFinExperimentale.AnimauxFournis",
		target: TFormFieldName.Strain,
		needsTranslation: true
	},
	{
		value:
			"Formulaire_Apafis.InformationsAdministrativesEtReglementaires.Projet.DescriptionProjet2.DerouleDuProjet",
		target: TFormFieldName.ExperimentalDesign,
		needsTranslation: true
	},
	{
		value:
			"Formulaire_Apafis.InformationsAdministrativesEtReglementaires.Animaux.AnimauxUtilises.JustificationUtilisationEspeces",
		target: TFormFieldName.SampleSizeCalculation,
		conversion: convertSampleSizeCalculation
	},
	{
		value:
			"Formulaire_Apafis.InformationsAdministrativesEtReglementaires.Animaux.AnimauxUtilises.JustificationUtilisationEspeces",
		target: TFormFieldName.SampleSizeCalculationDetails,
		needsTranslation: true
	},
	{
		value:
			"Formulaire_Apafis.InformationsAdministrativesEtReglementaires.Animaux.AnimauxUtilises.NombreAnimauxUtilises",
		target: TFormFieldName.SumOfAnimals
	},
	{
		value:
			"Formulaire_Apafis.InformationsAdministrativesEtReglementaires.EtablissementUtilisateur.AgrementUE.NumeroAgrement",
		target: TFormFieldName.OriginalAnimalEthicsCommitteeApplication
	},
	{
		value: [
			"Formulaire_Apafis.InformationsAdministrativesEtReglementaires.Animaux.PointsLimitesAdaptes",
			"Formulaire_Apafis.ProceduresExperimentales.ExplicationsProcedures.Procedure.DescriptionDetaillee.MethodeSuppressionDouleur",
			"Formulaire_Apafis.ProceduresExperimentales.ExplicationsProcedures.Procedure.DescriptionDetaillee.MethodeSuppressionSouffrance"
		],
		target: TFormFieldName.AdditionalInformation,
		needsTranslation: true
	},
	{
		value:
			"Formulaire_Apafis.InformationsAdministrativesEtReglementaires.EtablissementUtilisateur.ResponsablesMiseEnOeuvre.CoordonneesResponsablesMiseEnOeuvre",
		target: TFormFieldName.ContactEmail,
		conversion: convertContactEmail
	}
];

export function convertFC3RtoKeyValuePairs(data: any) {
	return FC3Rfields.reduce((base, next) => {
		let value;
		if (typeof next.value === "string") {
			value = getNestedValue(next.value, data);
		} else if (Array.isArray(next.value)) {
			value = next.value.map(keyToMap => getNestedValue(keyToMap, data)).join("<br /><br />");
		}
		base[next.target] = next.conversion ? next.conversion(value) : value;
		return base;
	}, {});
}

function convertStudyStage(object: object) {
	const prefix = "Point";
	const exploratory = ["A", "D", "E", "F", "G"];
	const confirmatory = ["B", "C"];
	const all = [...exploratory, ...confirmatory];

	const isExploratory =
		exploratory.some(point => object[`${prefix}${point}`] === "true") ||
		all.every(point => object[`${prefix}${point}`] === "false");
	const isConfirmatory =
		confirmatory.some(point => object[`${prefix}${point}`] === "true") ||
		all.every(point => object[`${prefix}${point}`] === "true");

	if ((isExploratory && isConfirmatory) || (!isExploratory && !isConfirmatory)) {
		return null;
	} else if (isExploratory) {
		return "study_stage_1_value";
	} else if (isConfirmatory) {
		return "study_stage_2_value";
	} else {
		return null;
	}
}

function convertResearchField(purposes: string[]) {
	if (!purposes || !Array.isArray(purposes)) {
		return null;
	}
	return purposes.join(", ");
}

function convertExclusiveAnimalUse(wasReused: string) {
	if (wasReused === "true") {
		return "no";
	} else {
		return "yes";
	}
}

function convertExclusiveAnimalUseDetails(wasReused: string) {
	if (wasReused === "true") {
		return "animals used in a previous project";
	} else {
		return null;
	}
}

function convertSpecies(object: object) {
	const usedSpecies = Object.keys(object).find(species => object[species] === "true");

	switch (usedSpecies) {
		case "Chats":
			return "cat";
		case "Chiens":
			return "dog";
		case "Furets":
			return "ferret";
		case "Caprins":
			return "goat";
		case "Cobayes":
			return "guinea_pig";
		case "HamstersSyriens":
		case "HamstersChinois":
			return "hamster";
		case "Chevaux":
			return "horse";
		case "Souris":
			return "mouse";
		case "Prosimien":
		case "Ouistitis":
		case "SingeCynomologue":
		case "SingeRhesus":
		case "Vervets":
		case "Babouins":
		case "Sairimis":
		case "AutresSingesAncienMonde":
		case "AutresSingesNouveauMonde":
		case "AutresPrimateNonHumain":
		case "SingesAntropoides":
			return "monkey";
		case "Porcs":
			return "pig";
		case "Lapins":
			return "rabbit";
		case "Rats":
			return "rat";
		case "Ovins":
			return "sheep";
		default:
			return "other";
	}
}

function convertOtherSpecies(object: object) {
	const species = convertSpecies(object);

	if (species === "other") {
		const usedSpecies = Object.keys(object).find(species => object[species] === "true");
		return usedSpecies ? usedSpecies.split(/(?=[A-Z])/).join(" ") : null;
	} else {
		return null;
	}
}

function convertSampleSizeCalculation(calcDetails: string) {
	return calcDetails ? "yes" : "no";
}

function convertContactEmail(
	contact: (object & { Email: string }) | (object & { Email: string }[])
) {
	if (Array.isArray(contact)) {
		return contact[0].Email;
	} else if (!!contact && typeof contact === "object") {
		return contact.Email;
	} else {
		return null;
	}
}
