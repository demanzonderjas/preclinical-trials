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
	const { changes = [], activeRevisionDate, prevRevisionDate } = useRevisions();
	const { t } = useTranslationStore();
	const hasChange = changes.find(
		c =>
			c.key === field.id ||
			fields.filter(f => f.showValueIn === field.id).some(f => f.id === c.key)
	);
	return (
		<div className="value">
			{!!hasChange && <div className="revision label">{activeRevisionDate}</div>}
			<ProtocolValue
				id={field.id}
				value={!!hasChange ? hasChange.new_value : field.value}
				fields={fields}
				valueMap={valueMap}
			/>
			{!!hasChange && <div className="current label">{prevRevisionDate}</div>}
			{!!hasChange && (
				<ProtocolValue
					id={field.id}
					value={hasChange.old_value}
					fields={fields}
					valueMap={valueMap}
				/>
			)}
		</div>
	);
});
