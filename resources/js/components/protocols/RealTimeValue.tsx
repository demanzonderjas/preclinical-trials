import React from "react";
import { useRevisions } from "../../hooks/useRevisions";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { TFormField } from "../../typings/forms";

export const RealTimeValue: React.FC<{
	field: TFormField;
	fields: TFormField[];
	offset?: number;
}> = ({ field, offset = 0, fields }) => {
	const { changes = [], activeRevisionNumber, revisions = [] } = useRevisions();
	const { t } = useTranslationStore();

	const hasChange = changes.find(
		c =>
			c.key === field.id ||
			fields.filter(f => f.showValueIn === field.id).some(f => f.id === c.key)
	);

	const futureRevisionChange = revisions
		.filter((r, index) => index >= activeRevisionNumber - offset)
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
		<div
			style={{ display: "inline-block" }}
			dangerouslySetInnerHTML={{ __html: t(getRealValue()) }}
		/>
	);
};
