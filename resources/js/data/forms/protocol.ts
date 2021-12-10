import { TAlignment, TForm, TFormName, TFormStyle, TSectionName } from "../../typings/forms";
import { accuracyField } from "./fields/protocol/accuracy";
import { applicationField, applicationNumberField } from "./fields/protocol/application";
import {
	blindedAssessmentField,
	blindedAssessmentHowField,
	blindedAssessmentPartiallyField,
	blindedInterventionField,
	blindedInterventionHowField,
	blindedInterventionPartiallyField
} from "./fields/protocol/blinding";
import { contactEmailField, contactNameField, contactRoleField } from "./fields/protocol/contact";
import { endDateField, startDateField } from "./fields/protocol/date";
import { embargoField } from "./fields/protocol/embargo";
import {
	animalsExclusiveUseField,
	noExclusiveAnimalUseDetailsField
} from "./fields/protocol/exclusiveUse";
import { hypothesisField } from "./fields/protocol/hypothesis";
import { interventionTypeField, placeboControlledField } from "./fields/protocol/intervention";
import { linkToDataField } from "./fields/protocol/linkToData";
import {
	otherInterventionTypeField,
	otherSpeciesField,
	otherSupportField
} from "./fields/protocol/other";
import {
	primaryReadoutParameterField,
	secondaryReadoutParameterField
} from "./fields/protocol/parameters";
import {
	noRandomisationDetailsField,
	randomisationDetailsField,
	randomisationField,
	randomisationMethodUsedField
} from "./fields/protocol/randomisation";
import { researchField } from "./fields/protocol/researchField";
import {
	sampleSizeCalculationDetailsField,
	sampleSizeCalculationField
} from "./fields/protocol/sampleSize";
import { sexField } from "./fields/protocol/sex";
import { speciesField } from "./fields/protocol/species";
import { studyStageField } from "./fields/protocol/stage";
import { statusField } from "./fields/protocol/status";
import { strainField } from "./fields/protocol/strain";
import { studyCentreField } from "./fields/protocol/studyCentre";
import { studyArmsField } from "./fields/protocol/studyArms";
import { supportField } from "./fields/protocol/support";
import { shortTitleField, titleField } from "./fields/protocol/title";
import { experimentalDesignField } from "./fields/protocol/experimentalDesign";

export const createProtocolForm: TForm = {
	id: TFormName.CreateProtocol,
	style: TFormStyle.WithSections,
	keepValuesAfterSubmit: true,
	submitText: "save",
	fields: [
		titleField,
		shortTitleField,
		supportField,
		otherSupportField,
		startDateField,
		endDateField,
		statusField,
		researchField,
		hypothesisField,
		interventionTypeField,
		otherInterventionTypeField,
		studyStageField,
		primaryReadoutParameterField,
		secondaryReadoutParameterField,
		animalsExclusiveUseField,
		noExclusiveAnimalUseDetailsField,
		speciesField,
		otherSpeciesField,
		strainField,
		sexField,
		experimentalDesignField,
		sampleSizeCalculationField,
		sampleSizeCalculationDetailsField,
		studyArmsField,
		randomisationField,
		noRandomisationDetailsField,
		randomisationMethodUsedField,
		randomisationDetailsField,
		blindedInterventionField,
		blindedInterventionHowField,
		blindedInterventionPartiallyField,
		blindedAssessmentField,
		blindedAssessmentHowField,
		blindedAssessmentPartiallyField,
		placeboControlledField,
		applicationField,
		applicationNumberField,
		linkToDataField,
		embargoField,
		contactNameField,
		contactRoleField,
		contactEmailField,
		studyCentreField,
		accuracyField
	],
	align: TAlignment.Left
};

export const protocolSections: TSectionName[] = [
	TSectionName.General,
	TSectionName.StudyDesign,
	TSectionName.ContactDetails,
	TSectionName.StudyCentreDetails,
	TSectionName.Submit
];
