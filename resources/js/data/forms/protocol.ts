import {
	TAlignment,
	TForm,
	TFormFieldName,
	TFormName,
	TFormStyle,
	TSectionName
} from "../../typings/forms";
import { accuracyField } from "./fields/protocol/accuracy";
import { applicationField } from "./fields/protocol/application";
import {
	blindedAssessmentField,
	blindedAssessmentHowField,
	blindedAssessmentNoField,
	blindedAssessmentPartiallyField,
	blindedInterventionField,
	blindedInterventionHowField,
	blindedInterventionNoField,
	blindedInterventionPartiallyField
} from "./fields/protocol/blinding";
import { contactEmailField, contactNameField, contactRoleField } from "./fields/protocol/contact";
import { endDateField, startDateField } from "./fields/protocol/date";
import { embargoField, liftEmbargoField } from "./fields/protocol/embargo";
import {
	animalsExclusiveUseField,
	noExclusiveAnimalUseDetailsField
} from "./fields/protocol/exclusiveUse";
import { hypothesisField } from "./fields/protocol/hypothesis";
import { interventionTypeField, placeboControlledField } from "./fields/protocol/intervention";
import { linkToDataField, linkToPublicationField } from "./fields/protocol/linkToData";
import {
	otherInterventionTypeField,
	otherRandomisationDetailsField,
	otherRandomisationMethodField,
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
	noSampleSizeCalculationDetailsField,
	sampleSizeCalculationDetailsField,
	sampleSizeCalculationField,
	sumOfAnimalsField
} from "./fields/protocol/sampleSize";
import { sexField } from "./fields/protocol/sex";
import { speciesField } from "./fields/protocol/species";
import { studyStageField } from "./fields/protocol/stage";
import {
	statusField,
	whyAmendmentField,
	whyStudyStatusInterruptedField
} from "./fields/protocol/status";
import { strainField } from "./fields/protocol/strain";
import { studyCentreField } from "./fields/protocol/studyCentre";
import { studyArmsField } from "./fields/protocol/studyArms";
import { funderField, supportField } from "./fields/protocol/support";
import { shortTitleField, titleField } from "./fields/protocol/title";
import { experimentalDesignField } from "./fields/protocol/experimentalDesign";
import { messageField } from "./fields/admin/content";
import { additionalInfoField } from "./fields/protocol/additionalInfo";
import { importTypeField } from "./fields/protocol/import";

export const createProtocolForm: TForm = {
	id: TFormName.CreateProtocol,
	style: TFormStyle.WithSections,
	keepValuesAfterSubmit: true,
	submitText: "save",
	fields: [
		titleField,
		shortTitleField,
		supportField,
		funderField,
		otherSupportField,
		startDateField,
		endDateField,
		statusField,
		whyStudyStatusInterruptedField,
		linkToPublicationField,
		studyStageField,
		researchField,
		hypothesisField,
		interventionTypeField,
		otherInterventionTypeField,
		placeboControlledField,
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
		noSampleSizeCalculationDetailsField,
		sumOfAnimalsField,
		studyArmsField,
		randomisationField,
		noRandomisationDetailsField,
		randomisationMethodUsedField,
		otherRandomisationMethodField,
		randomisationDetailsField,
		otherRandomisationDetailsField,
		blindedInterventionField,
		blindedInterventionNoField,
		blindedInterventionHowField,
		blindedInterventionPartiallyField,
		blindedAssessmentField,
		blindedAssessmentNoField,
		blindedAssessmentHowField,
		blindedAssessmentPartiallyField,
		applicationField,
		additionalInfoField,
		linkToDataField,
		contactNameField,
		contactRoleField,
		contactEmailField,
		studyCentreField,
		embargoField,
		accuracyField,
		importTypeField
	],
	align: TAlignment.Left
};

export const editPublishedProtocolForm: TForm = {
	id: TFormName.EditPublishedProtocol,
	style: TFormStyle.RegularLabels,
	keepValuesAfterSubmit: true,
	submitText: "update_status",
	fields: [statusField, whyStudyStatusInterruptedField, linkToPublicationField, liftEmbargoField],
	align: TAlignment.Left
};

export const amendPublishedProtocolForm: TForm = {
	id: TFormName.AmendPublishedProtocol,
	style: TFormStyle.RegularLabels,
	keepValuesAfterSubmit: true,
	submitText: "update_status",
	fields: [
		...createProtocolForm.fields.filter(f => f.id !== TFormFieldName.StatementOfAccuracy),
		whyAmendmentField,
		accuracyField
	],
	align: TAlignment.Left
};

export const rejectProtocolForm: TForm = {
	id: TFormName.RejectProtocol,
	style: TFormStyle.InlinePlaceholder,
	keepValuesAfterSubmit: false,
	submitText: "send",
	fields: [messageField],
	align: TAlignment.Center
};

export const protocolSections: TSectionName[] = [
	TSectionName.General,
	TSectionName.StudyDesign,
	TSectionName.ContactDetails,
	TSectionName.Submit
];

export const viewableProtocolSections: TSectionName[] = [
	TSectionName.General,
	TSectionName.StudyDesign,
	TSectionName.ContactDetails,
	TSectionName.LinkedProtocols
];
