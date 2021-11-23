import { StudyCentreField } from "../../../../components/forms/protocols/StudyCentreField";
import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";
import { TStudyCentre } from "../../../../typings/protocols";
import { validateMultiRowField } from "../../../../utils/validation";

export const studyCentreModel: TStudyCentre = {
	name: "",
	city: "",
	country: ""
};

export const studyCentreField: TFormField = {
	id: TFormFieldName.StudyCentre,
	label: "study_centre_details",
	Component: StudyCentreField,
	required: true,
	validate: validateMultiRowField,
	value: [{ ...studyCentreModel }],
	section: TSectionName.StudyCentreDetails,
	description: "study_centre_description"
};
