import { action, makeAutoObservable } from "mobx";
import translations from "../data/translations/en.json";
import { TTranslations } from "../typings/layout";

export class TranslationStore {
	__: TTranslations = translations;

	constructor() {
		makeAutoObservable(this, {
			t: action.bound
		});
	}

	t(label: string) {
		return this.__[label] || label || "label_not_found";
	}
}
