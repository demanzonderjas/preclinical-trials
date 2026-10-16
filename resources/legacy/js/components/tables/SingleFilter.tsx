import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { useFilter } from "../../hooks/useFilter";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { TFormFieldName } from "../../typings/forms";
import { GenericSelectField } from "../forms/SelectField";

export const SingleFilter: React.FC<{
	selectionKey: TFormFieldName;
	options: string[];
	filterIndex: number;
	defaultValue?: string;
	label: string;
	filterPlaceholder?: string;
}> = observer(({ selectionKey, options, filterIndex, filterPlaceholder, label, defaultValue }) => {
	const { setFilterIndex, filters } = useFilter();
	const { t } = useTranslationStore();

	useEffect(() => {
		if (defaultValue) {
			setFilterIndex(filterIndex, { value: t(defaultValue), key: selectionKey });
		} else {
			setFilterIndex(filterIndex, { value: "", key: selectionKey });
		}
	}, []);

	const activeFilter: string = filters[filterIndex] ? t(filters[filterIndex].value) : "";

	return (
		<div className="SingleFilter" style={{ display: "flex", margin: "10px 0" }}>
			<label style={{ fontSize: "18px", width: "200px" }}>{t(label)}</label>
			<GenericSelectField
				setValue={value => {
					setFilterIndex(filterIndex, { value, key: selectionKey });
				}}
				minWidth={300}
				value={activeFilter}
				options={[...options]}
				clearPlaceholder="clear"
				emptyPlaceholder={filterPlaceholder || "any_field"}
			/>
		</div>
	);
});
