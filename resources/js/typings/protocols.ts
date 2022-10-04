import { TFormFieldName } from "./forms";

export type TStudyCentre = {
	name: string;
	city: string;
	country: string;
};

export type TStudyArm = {
	type: string;
	number: number;
	intervention: string;
};

export type TProtocol = { [K in TFormFieldName]: any };

export type TDBProtocol = {
	id: number;
	pct_id: string;
	user_id: number;
	status: TProtocolStatus;
	details: TDetail[];
	revisions: TRevision[];
	comments: TAdminAction[];
	title: string;
	created_at: string;
	updated_at: string;
};

export enum TProtocolStatus {
	Draft = "draft",
	SubmittedForPublication = "submitted_for_publication",
	ResubmittedForPublication = "resubmitted_for_publication",
	Published = "published",
	Rejected = "rejected"
}

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

export type TAdminAction = {
	id: number;
	protocol_id: number;
	action: string;
	message: string;
	created_at: string;
};

export type TPRISConversion = {
	value: string;
	target: TFormFieldName;
	conversion?: (value: any) => any;
};
