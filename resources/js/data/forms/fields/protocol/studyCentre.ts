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
	label: "Study centre details",
	Component: StudyCentreField,
	required: true,
	validate: validateMultiRowField,
	value: [{ ...studyCentreModel }],
	section: TSectionName.StudyCentreDetails,
	description:
		"Give the details of the institutions where the experiments will be undertaken. Add additional lines if there is more than one"
};
