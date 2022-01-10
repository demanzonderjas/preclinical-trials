import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { useFilter } from "../../hooks/useFilter";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { TFormFieldName } from "../../typings/forms";
import { GenericSelectField } from "../forms/SelectField";

export const SingleFilter: React.FC<{
	selectionKey: TFormFieldName;
	options: string[];
	defaultValue?: string;
	filterPlaceholder?: string;
}> = observer(({ selectionKey, options, filterPlaceholder, defaultValue }) => {
	const { setActiveFilterKey, activeFilterText, setActiveFilterText } = useFilter();
	const { t } = useTranslationStore();

	useEffect(() => {
		setActiveFilterKey(selectionKey);
		if (defaultValue) {
			setActiveFilterText(t(defaultValue));
		}
	}, []);

	return (
		<div className="SingleFilter">
			<GenericSelectField
				setValue={value => setActiveFilterText(value)}
				value={activeFilterText || ""}
				options={[...options]}
				clearPlaceholder="clear"
				emptyPlaceholder={filterPlaceholder || "any_field"}
			/>
		</div>
	);
});
