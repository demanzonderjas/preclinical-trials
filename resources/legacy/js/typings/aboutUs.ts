export type TAboutUs = {
	image: string;
	name: string;
	title?: string;
	workLocation?: string;
	role: TAboutUsType;
};

export enum TAboutUsType {
	DailyDirector = "daily_director",
	SteeringCommittee = "steering_committee"
}

export type TAmbassador = {
	id?: number;
	name: string;
	description: string;
	geo_search: string;
	longitude: string;
	latitude: string;
};

export type TMapConfig = {
	accessToken: string;
	positions: TCoord[];
};

export type TLangitude = number;
export type TLongitude = number;

export type TCoord = [TLangitude, TLongitude];
