export type TMessage = {
	id: number;
	user_id?: number;
	name?: string;
	text: string;
	is_mine: boolean;
	created_at: string;
};
