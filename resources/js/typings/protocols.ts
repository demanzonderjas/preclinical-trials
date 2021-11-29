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
	user_id: number;
	status: string;
	details: TDetail[];
	revisions: TRevision[];
	created_at: string;
	updated_at: string;
};

export type TDetail = { key: TFormFieldName; value: any };

export enum TProtocolOverviewType {
	Table = "table",
	Cards = "cards"
}

export type TRevisionChange = {
	key: TFormFieldName;
	old_value: any;
	new_value: any;
};

export type TRevision = {
	id: number;
	protocol_id: number;
	changes: TRevisionChange[];
	created_at: string;
};

export type TPRISConversion = {
	value: string;
	target: TFormFieldName;
	conversion?: (value: any) => any;
};
