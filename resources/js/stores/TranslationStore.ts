import { observable, action } from "mobx";
import translations from "../data/translations/en.json";

export class TranslationStore {
	@observable __ = translations;

	@action.bound t(label: string) {
		return this.__[label] || label;
	}
}
