import { observer } from "mobx-react-lite";
import React from "react";
import { useFilter } from "../../hooks/useFilter";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { TFormFieldName } from "../../typings/forms";
import { GenericSelectField } from "../forms/SelectField";

export const Filter: React.FC<{ options: string[] }> = observer(({ options }) => {
	const { t } = useTranslationStore();
	const {
		activeFilterText,
		setActiveFilterText,
		activeFilterKey,
		setActiveFilterKey,
		addFilter,
		filters
	} = useFilter();

	console.log(filters);

	return (
		<div className="Filter">
			<input
				type="text"
				placeholder={t("enter_search")}
				value={activeFilterText}
				onChange={e => setActiveFilterText(e.target.value)}
			/>
			<GenericSelectField
				setValue={value => setActiveFilterKey(value as TFormFieldName)}
				value={activeFilterKey || ""}
				options={options}
			/>
			<div className="AddFilter" onClick={addFilter}>
				<span>{t("add_filter")}</span>
			</div>
		</div>
	);
});
