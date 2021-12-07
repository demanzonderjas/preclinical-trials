export type TFaqCategory = {
	id: number;
	name: string;
	order: number;
	faq_items: TFaqItem[];
};

export type TFaqItem = {
	id: number;
	faq_category_id: number;
	title: string;
	content: string;
	status: TPublishStatus;
};

export enum TPublishStatus {
	Draft = "draft",
	Published = "published"
}
