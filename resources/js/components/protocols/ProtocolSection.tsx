import React, { useState } from "react";
import { TFormField, TSectionName } from "../../typings/forms";
import { Image } from "../base/Image";
import { ProtocolValue } from "./ProtocolValue";
import cx from "classnames";
import { useTranslationStore } from "../../hooks/useTranslationStore";

export const ProtocolSection: React.FC<{
	name: TSectionName;
	fields: TFormField[];
	shouldBeOpen: boolean;
}> = ({ name, fields, shouldBeOpen }) => {
	const [isExpanded, setIsExpanded] = useState(shouldBeOpen);
	const { t } = useTranslationStore();

	return (
		<div className={cx("ProtocolSection", { active: isExpanded })}>
			<div className="icon" onClick={() => setIsExpanded(!isExpanded)}>
				<Image filename={isExpanded ? "minus.png" : "plus.png"} />
			</div>
			<div className="SectionHeader" onClick={() => setIsExpanded(!isExpanded)}>
				<h2>{t(name)}</h2>
			</div>
			<div className="KeyValuePairs">
				{fields.map(f => (
					<div className="KeyValue" key={f.id}>
						<label className="key">{t(f.label || f.id)}</label>
						<div className="value">
							<ProtocolValue id={f.id} value={f.value} />
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
