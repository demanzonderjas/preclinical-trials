import { action, makeAutoObservable } from "mobx";
import { getUserQuery } from "../queries/account";
import { TUser } from "../typings/auth";

export class UserStore {
	user: TUser = null;

	constructor() {
		makeAutoObservable(this, {
			isMine: action.bound,
			fetchUser: action.bound
		});
		this.fetchUser();
	}

	async fetchUser() {
		const user = await getUserQuery();
		if (user.success !== false) {
			action(() => {
				this.user = user;
			})();
		}
	}

	isMine(userId: number) {
		return this.user && this.user.id == userId;
	}
}
