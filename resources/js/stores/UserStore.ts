import { action, makeAutoObservable } from "mobx";
import { getUserQuery } from "../queries/account";
import { updateSettingQuery } from "../queries/user";
import { TSettingName, TUser } from "../typings/auth";

export class UserStore {
	user: TUser = null;

	constructor() {
		makeAutoObservable(this, {
			isMine: action.bound,
			updateSetting: action.bound,
			getSettingValue: action.bound,
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

	async updateSetting(key: TSettingName, value: any) {
		await updateSettingQuery(key, value);
		const settingIndex = this.user.settings.findIndex(s => s.key === key);
		if (settingIndex > -1) {
			this.user.settings[settingIndex].value = value;
		} else {
			this.user.settings.push({ key, value });
		}
	}

	getSettingValue(key: TSettingName) {
		return this.user.settings.find(s => s.key === key)?.value;
	}

	isMine(userId: number) {
		return this.user && this.user.id == userId;
	}
}
