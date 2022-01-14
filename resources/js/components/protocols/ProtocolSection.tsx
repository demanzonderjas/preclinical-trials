import React, { useState } from "react";
import { TFormField, TFormFieldName, TSectionName } from "../../typings/forms";
import { Image } from "../base/Image";
import { ProtocolValue } from "./ProtocolValue";
import cx from "classnames";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { fieldMeetsDependencies } from "../../utils/validation";
import { useRevisions } from "../../hooks/useRevisions";
import { observer } from "mobx-react-lite";
import { RevisionValue } from "./RevisionValue";

export const ProtocolSection: React.FC<{
	name: TSectionName;
	fields: TFormField[];
	shouldBeOpen: boolean;
}> = observer(({ name, fields, shouldBeOpen }) => {
	const [isExpanded, setIsExpanded] = useState(shouldBeOpen);
	const { t } = useTranslationStore();
	const { changes = [] } = useRevisions();
	const valueMap = fields.reduce((base, field) => {
		base.set(field.id, field.value);
		return base;
	}, new Map<TFormFieldName, any>());
	const changeCount = changes.reduce((base, change) => {
		const changeBelongsToSection = fields.some(
			f => f.id === change.key && fieldMeetsDependencies(f, valueMap)
		);
		return changeBelongsToSection ? base + 1 : base;
	}, 0);

	return (
		<div className={cx("ProtocolSection", { active: isExpanded })}>
			<div className="icon" onClick={() => setIsExpanded(!isExpanded)}>
				<Image filename={isExpanded ? "minus.png" : "plus.png"} />
			</div>
			<div className="SectionHeader" onClick={() => setIsExpanded(!isExpanded)}>
				<h2>{t(name)}</h2>
				{!!changeCount && (
					<div className="changes">
						{changeCount} {t(changeCount === 1 ? "change" : "changes")}
					</div>
				)}
			</div>
			<div className="KeyValuePairs">
				{fields
					.filter(f => !f.showValueIn && fieldMeetsDependencies(f, valueMap))
					.map(f => (
						<div className="KeyValue" key={f.id}>
							<label className="key">{t(f.label || f.id)}</label>
							<RevisionValue field={f} fields={fields} valueMap={valueMap} />
						</div>
					))}
			</div>
		</div>
	);
});
