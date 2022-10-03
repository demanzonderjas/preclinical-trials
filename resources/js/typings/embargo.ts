import { TDBProtocol } from "./protocols";

export type TEmbargoEndDate = {
	date: string;
	protocol: TDBProtocol;
};

export type TEmbargoExtension = {
	id: number;
	status: TEmbargoExtensionStatus;
	reason: string;
	protocol: TDBProtocol;
};

export enum TEmbargoExtensionStatus {
	Approved = "approved",
	AwaitingApproval = "awaiting_approval",
	Rejected = "rejected"
}
