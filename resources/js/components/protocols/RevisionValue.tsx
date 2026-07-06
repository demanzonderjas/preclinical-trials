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
	const revisionStore = useRevisions();
	const {
		changes = [],
		activeRevisionDate,
		activeRevisionNumber,
		prevRevisionDate
	} = revisionStore || {};
	const { t } = useTranslationStore();
	const hasChange = changes.find(
		c =>
			c.key === field.id ||
			fields.filter(f => f.showValueIn === field.id).some(f => f.id === c.key)
	);

	const getRealValue = () => {
		if (revisionStore) {
			return revisionStore.getValueAtVersion(field.id, revisionStore.activeVersion);
		}
		return field.value;
	};

	const valueMapPrev = React.useMemo(() => {
		if (!revisionStore) return valueMap;
		const prevVersion = revisionStore.activeVersion - 1;
		return fields.reduce((base, f) => {
			base.set(f.id, revisionStore.getValueAtVersion(f.id, prevVersion));
			return base;
		}, new Map<TFormFieldName, any>());
	}, [revisionStore, fields, valueMap]);

	const prevVersion = revisionStore ? revisionStore.activeVersion - 1 : 0;

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
					value={revisionStore ? revisionStore.getValueAtVersion(field.id, prevVersion) : null}
					offset={1}
					fields={fields}
					valueMap={valueMapPrev}
				/>
			)}
		</div>
	);
});
