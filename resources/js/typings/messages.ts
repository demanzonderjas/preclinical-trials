export type TMessage = {
	id: number;
	user_id?: number;
	name?: string;
	text: string;
	is_mine: boolean;
	created_at: string;
};

export type TChannel = {
	id: number;
	title: string;
	contact: string;
	latest_message: string;
	updated_at: string;
};
