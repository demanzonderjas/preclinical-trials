export type TPage = {
	id?: number;
	title: string;
	menu_title?: string;
	slug?: string;
	subtitle: string;
	content_blocks: TContentBlock[];
	created_at?: string;
	updated_at?: string;
};

export type TContentBlock = {
	type: TContentBlockType;
	content: string;
};

export enum TContentBlockType {
	Text = "text"
}
