import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";
import { firstNameField } from "../account/name";

export const otherSupportField: TFormField = {
	...firstNameField,
	id: TFormFieldName.OtherSupport,
	label: "Other",
	section: TSectionName.ContactDetails,
	dependencies: [{ key: TFormFieldName.FinancialSupport, value: "Other" }]
};
