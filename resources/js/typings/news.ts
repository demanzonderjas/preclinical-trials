export type TNewsItem = {
	id: number;
	title: string;
	status: TNewsItemStatus;
	summary: string;
	content: string;
	created_at: string;
	updated_at: string;
};

export enum TNewsItemStatus {
	Draft = "draft",
	Published = "published"
}
