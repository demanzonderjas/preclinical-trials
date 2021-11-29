import { action, makeAutoObservable } from "mobx";
import { getUserQuery } from "../queries/account";
import { TUser } from "../typings/auth";

export class UserStore {
	user: TUser = null;

	constructor() {
		this.fetchUser();
		makeAutoObservable(this, {
			isMine: action.bound
		});
	}

	async fetchUser() {
		const user = await getUserQuery();
		this.user = user;
	}

	isMine(userId: number) {
		return this.user && this.user.id == userId;
	}
}
