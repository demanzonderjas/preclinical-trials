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

export type TDBProtocol = {
	id: number;
	status: string;
	details: TDetail[];
	updated_at: string;
};

export type TDetail = { key: TFormFieldName; value: any };

export enum TProtocolOverviewType {
	Table = "table",
	Cards = "cards"
}
