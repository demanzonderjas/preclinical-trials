import { TFormFieldName } from "../typings/forms";
import { TNewsItem } from "../typings/news";
import { TProtocol } from "../typings/protocols";
import { TFilter } from "../typings/tables";
import day from "dayjs";
import { useTranslationStore } from "../hooks/useTranslationStore";
import translations from "../data/translations/en.json";

const t = (key: string) => {
	return translations[key] || key;
};

export function protocolMeetsFilters(
	activeFilterText: string,
	activeFilterKey: TFormFieldName,
	filters: TFilter[],
	row: TProtocol
) {
	const activeFilter: TFilter = { value: activeFilterText, key: activeFilterKey };

	return [activeFilter, ...filters].every(filter => {
		if (!filter.value) {
			return true;
		}
		if (!filter.key) {
			return Object.keys(row)
				.filter(key => !!t(row[key]))
				.some(key =>
					t(row[key])
						.toString()
						.toLowerCase()
						.includes(filter.value.toLowerCase())
				);
		}
		if (filter.key && filter.value && row[filter.key]) {
			return JSON.stringify(t(row[filter.key]))
				.toLowerCase()
				.includes(filter.value.toLowerCase());
		}
	});
}

export function newsItemMeetsFilters(
	activeFilterText: string,
	activeFilterKey: string,
	filters: TFilter[],
	row: TNewsItem
) {
	const activeFilter: TFilter = { value: activeFilterText, key: activeFilterKey };

	return [activeFilter, ...filters].every(filter => {
		if (!filter.value && !filter.key) {
			return true;
		}
		if (filter.key && !filter.value) {
			const targetYear = day(row.updated_at).get("year");
			return +filter.key == targetYear;
		}
		if (!filter.key && filter.value) {
			return JSON.stringify(row)
				.toLowerCase()
				.includes(filter.value.toLowerCase());
		}
		if (filter.key && filter.value) {
			const targetYear = day(row.updated_at).get("year");
			const hasValue = JSON.stringify(row)
				.toLowerCase()
				.includes(filter.value.toLowerCase());
			return hasValue && +filter.key == targetYear;
		}
	});
}

export function createQueryStringFromFilters(filters: TFilter[]) {
	return filters.reduce((base, filter) => {
		if (!base.length) {
			return `?${filter.key}=${filter.value}`;
		}
		return `${base}&${filter.key}=${filter.value}`;
	}, "");
}
