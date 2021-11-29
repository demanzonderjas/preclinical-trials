import day from "dayjs";
import { blindingOptions } from "../data/forms/fields/protocol/blinding";
import { interventionFieldOptions } from "../data/forms/fields/protocol/intervention";
import { studyStageOptions } from "../data/forms/fields/protocol/stage";
import { studyArmOptions } from "../data/forms/fields/protocol/studyArms";
import { supportFieldOptions } from "../data/forms/fields/protocol/support";
import { TFormFieldName } from "../typings/forms";
import { TPRISConversion, TStudyArm, TStudyCentre } from "../typings/protocols";

export function getNestedValue(target: string, data: any) {
	return target.split(".").reduce((base, next) => {
		if (base[next]) {
			return base[next];
		}
		return "";
	}, data);
}

export function convertPRIStoKeyValuePairs(prisData: any) {
	const PRISfields: TPRISConversion[] = [
		{
			value: "animalCommittee.applicationNumber",
			target: TFormFieldName.ApplicationNumber
		},
		{
			value: "animalCount",
			target: TFormFieldName.SumOfAnimals
		},
		{
			value: "animalSex",
			target: TFormFieldName.Sex,
			conversion: convertAnimalSex
		},
		{
			value: "blinding.intervention.selection",
			target: TFormFieldName.InvestigatorsBlindedIntervention,
			conversion: convertInvestigatorsBlinded
		},
		{
			value: "blinding.intervention.description",
			target: TFormFieldName.YesBlindedInterventionHow
		},
		{
			value: "blinding.outcome.selection",
			target: TFormFieldName.InvestigatorsBlindedAssesment,
			conversion: convertInvestigatorsBlinded
		},
		{
			value: "blinding.outcome.description",
			target: TFormFieldName.YesBlindedAssessmentHow
		},
		{
			value: "contact.email",
			target: TFormFieldName.ContactEmail
		},
		{
			value: "contact.name",
			target: TFormFieldName.ContactName
		},
		{
			value: "contact.role",
			target: TFormFieldName.ContactRole
		},
		{
			value: "date.end",
			target: TFormFieldName.EndDate,
			conversion: convertDate
		},
		{
			value: "date.start",
			target: TFormFieldName.StartDate,
			conversion: convertDate
		},
		{
			value: "endpoints.primary",
			target: TFormFieldName.PrimaryReadoutParameter
		},
		{
			value: "endpoints.secondary",
			target: TFormFieldName.SecondaryReadoutParameter
		},
		{
			value: "groups",
			target: TFormFieldName.StudyArms,
			conversion: convertStudyArms
		},
		{
			value: "hypotheses",
			target: TFormFieldName.Hypothesis
		},
		{
			value: "interventionType.description",
			target: TFormFieldName.OtherInterventionType
		},
		{
			value: "interventionType.selection",
			target: TFormFieldName.InterventionType,
			conversion: convertInterventionType
		},
		{
			value: "medicineFields",
			target: TFormFieldName.ResearchField
		},
		{
			value: "placeboArms",
			target: TFormFieldName.PlaceboControlled,
			conversion: convertBooleanToYesNo
		},
		{
			value: "randomisation.selection",
			target: TFormFieldName.Randomisation,
			conversion: convertSelectionToYesNo
		},
		{
			value: "randomisation.description",
			target: TFormFieldName.WhyNoRandomisation
		},
		{
			value: "reuseAnimals.selection",
			target: TFormFieldName.ExclusiveAnimalUse,
			conversion: convertSelectionToNoYes
		},
		{
			value: "sampleSize.selection",
			target: TFormFieldName.SampleSizeCalculation
		},
		{
			value: "sampleSize.description",
			target: TFormFieldName.NoSampleSizeCalculationDetails
		},
		{
			value: "shortTitle",
			target: TFormFieldName.ShortTitle
		},
		{
			value: "species.description",
			target: TFormFieldName.Species,
			conversion: convertSpecies
		},
		{
			value: "stage",
			target: TFormFieldName.StudyStage,
			conversion: convertSpecies
		},
		{
			value: "strains",
			target: TFormFieldName.Strain,
			conversion: convertStrain
		},
		{
			value: "studyCentres",
			target: TFormFieldName.StudyCentre,
			conversion: convertStudyCentres
		},
		{
			value: "supportSources.selection",
			target: TFormFieldName.FinancialSupport,
			conversion: convertSupportSources
		},
		{
			value: "title",
			target: TFormFieldName.Title
		}
	];

	return PRISfields.reduce((base, next) => {
		const value = getNestedValue(next.value, prisData);
		base[next.target] = next.conversion ? next.conversion(value) : value;
		return base;
	}, {});
}

export function convertDate(date: string) {
	if (!date) {
		return "";
	}
	const newDate = day(date).format("YYYY-MM-DD");
	return newDate;
}

export function convertSupportSources(sources: number[]) {
	return sources.map(sourceIndex => supportFieldOptions[sourceIndex]);
}

export function convertStudyCentres(centre: any): TStudyCentre[] {
	return [
		{
			name: centre.name,
			city: centre.city || "",
			country: centre.country
		}
	];
}

export function convertStrain(strains: any[]) {
	return strains.reduce((base, next) => {
		const newValue = `${next.description} - ${next.supplier} - ${next.speciesCode}`;
		if (!base) {
			return newValue;
		}
		return `- ${newValue} -`;
	}, "");
}

export function convertStudyStage(value: number) {
	return studyStageOptions[value].value;
}

export function convertSpecies(value: string) {
	const mappingTable = {
		Mice: "mouse"
	};
	return mappingTable[value] || "";
}

export function convertSelectionToNoYes(value: number) {
	return value === 1 ? "no" : "yes";
}

export function convertSelectionToYesNo(value: number) {
	return value === 1 ? "yes" : "no";
}

export function convertBooleanToYesNo(value: boolean) {
	return !!value ? "yes" : "no";
}

export function convertAnimalSex(value: string) {
	const mappingTable = {
		M: "male",
		F: "female",
		B: "both"
	};
	return mappingTable[value] || "";
}

export function convertInvestigatorsBlinded(selection: number) {
	return blindingOptions[selection];
}

export function convertInterventionType(selection: number) {
	return interventionFieldOptions[selection];
}

export function convertStudyArms(studyArms: any[]): TStudyArm[] {
	if (!studyArms) {
		return [];
	}
	return studyArms.map(arm => ({
		arm:
			arm.type && arm.type.selection
				? studyArmOptions[arm.type.selection]
				: studyArmOptions[0],
		intervention: arm.name,
		number: arm.count
	}));
}
