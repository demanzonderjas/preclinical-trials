import { TFormFieldName } from "../typings/forms";
import { TProtocol } from "../typings/protocols";
import { TFilter } from "../typings/tables";

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
			return JSON.stringify(row)
				.toLowerCase()
				.includes(filter.value.toLowerCase());
		}
		if (filter.key && filter.value) {
			return JSON.stringify(row[filter.key])
				.toLowerCase()
				.includes(filter.value.toLowerCase());
		}
	});
}
