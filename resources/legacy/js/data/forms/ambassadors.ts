import { TAlignment, TForm, TFormName, TFormStyle } from "../../typings/forms";
import { geoSearchField, latitudeField, longitudeField } from "./fields/admin/geoSearch";
import { contactFormNameField } from "./fields/account/name";
import { descriptionField } from "./fields/admin/content";

export const addAmbassadorForm: TForm = {
	id: TFormName.AddAmbassador,
	style: TFormStyle.RegularLabels,
	align: TAlignment.Left,
	fields: [contactFormNameField, descriptionField, geoSearchField, longitudeField, latitudeField],
	submitText: "save"
};
