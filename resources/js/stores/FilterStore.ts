import { action, makeAutoObservable } from "mobx";
import { TFormFieldName } from "../typings/forms";
import { TFilter } from "../typings/tables";

export class FilterStore {
	activeFilterText: string = "";
	activeFilterKey: TFormFieldName = null;
	filters: TFilter[] = [];

	constructor() {
		makeAutoObservable(this, {
			setActiveFilterText: action.bound,
			setActiveFilterKey: action.bound,
			addFilter: action.bound,
			deleteFilter: action.bound
		});
	}

	setActiveFilterText(value: string) {
		this.activeFilterText = value;
	}

	setActiveFilterKey(value: TFormFieldName) {
		this.activeFilterKey = value;
	}

	addFilter() {
		if (!this.activeFilterText && !this.activeFilterKey) {
			return;
		}
		this.filters.push({ value: this.activeFilterText, key: this.activeFilterKey });
		this.setActiveFilterKey(null);
		this.setActiveFilterText("");
	}

	deleteFilter(idx: number) {
		const filters = [...this.filters];
		filters.splice(idx, 1);
		this.filters = filters;
	}
}
