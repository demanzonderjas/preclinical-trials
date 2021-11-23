import { observer } from "mobx-react-lite";
import React from "react";
import { useFilter } from "../../hooks/useFilter";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { TFormFieldName } from "../../typings/forms";

export const Filter: React.FC<{ options: string[] }> = observer(({ options }) => {
	const { t } = useTranslationStore();
	const {
		activeFilterText,
		setActiveFilterText,
		activeFilterKey,
		setActiveFilterKey
	} = useFilter();

	return (
		<div className="Filter">
			<input
				type="text"
				value={activeFilterText}
				onChange={e => setActiveFilterText(e.target.value)}
			/>
			<select
				value={activeFilterKey || ""}
				onChange={e => setActiveFilterKey(e.target.value as TFormFieldName)}
			>
				<option value="">{t("any_field")}</option>
				{options.map(option => (
					<option key={option} value={option}>
						{t(option)}
					</option>
				))}
			</select>
		</div>
	);
});
