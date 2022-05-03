import { observer } from "mobx-react-lite";
import React from "react";
import { useRevisions } from "../../hooks/useRevisions";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { TFormField, TFormFieldName } from "../../typings/forms";
import { ProtocolValue } from "./ProtocolValue";

export const RevisionValue: React.FC<{
	field: TFormField;
	fields: TFormField[];
	valueMap: Map<TFormFieldName, any>;
}> = observer(({ field, fields, valueMap }) => {
	const {
		changes = [],
		activeRevisionDate,
		activeRevisionNumber,
		prevRevisionDate,
		revisions = []
	} = useRevisions();
	const { t } = useTranslationStore();
	const hasChange = changes.find(
		c =>
			c.key === field.id ||
			fields.filter(f => f.showValueIn === field.id).some(f => f.id === c.key)
	);
	console.log("revisions", revisions);

	const futureRevisionChange = revisions
		.filter((r, index) => index >= activeRevisionNumber)
		.find(r => r.changes.some(c => c.key === field.id));

	const futureValue = futureRevisionChange
		? futureRevisionChange.changes.find(c => c.key === field.id)
		: null;

	const getRealValue = () => {
		if (futureValue && activeRevisionNumber > 0) {
			return futureValue.old_value;
		} else if (!!hasChange) {
			return hasChange.new_value;
		} else {
			return field.value;
		}
	};

	return (
		<div className="value">
			{!!hasChange && <div className="revision label">{activeRevisionDate}</div>}
			<ProtocolValue
				id={field.id}
				value={getRealValue()}
				fields={fields}
				valueMap={valueMap}
			/>
			{!!hasChange && <div className="current label">{prevRevisionDate}</div>}
			{!!hasChange && (
				<ProtocolValue
					id={field.id}
					value={hasChange.old_value}
					offset={1}
					fields={fields}
					valueMap={valueMap}
				/>
			)}
		</div>
	);
});
