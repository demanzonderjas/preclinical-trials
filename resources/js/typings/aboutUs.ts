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
