import { TFormFieldName } from "./forms";

export type TStudyCentre = {
	name: string;
	city: string;
	country: string;
};

export type TStudyArm = {
	arm: string;
	number: number;
	intervention: string;
};

export type TProtocol = { [K in TFormFieldName]: any };
