import React from "react";
import { useRevisions } from "../../hooks/useRevisions";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { TFormField } from "../../typings/forms";
import xss from "xss";
import { observer } from "mobx-react-lite";

export const RealTimeValue: React.FC<{
	field: TFormField;
	fields: TFormField[];
	offset?: number;
}> = observer(({ field, offset = 0 }) => {
	const revisionStore = useRevisions();
	const { t } = useTranslationStore();

	const getRealValue = () => {
		if (revisionStore) {
			const version = revisionStore.activeVersion - offset;
			return revisionStore.getValueAtVersion(field.id, version);
		}
		return field.value;
	};

	return (
		<div
			style={{ display: "inline-block" }}
			dangerouslySetInnerHTML={{ __html: xss(t(getRealValue())) }}
		/>
	);
});
