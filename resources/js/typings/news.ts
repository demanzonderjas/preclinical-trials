export type TNewsItem = {
	id: number;
	title: string;
	status: TNewsItemStatus;
	image?: string;
	summary: string;
	content: string;
	publish_date?: string;
	created_at: string;
	updated_at: string;
};

export enum TNewsItemStatus {
	Draft = "draft",
	Published = "published"
}
