import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { useForm } from "../../hooks/useForm";
import { TFormFieldName, TSectionName } from "../../typings/forms";
import cx from "classnames";
import { saveProtocolQuery, updateProtocolQuery } from "../../queries/protocol";
import { TProtocol } from "../../typings/protocols";
import { useParams } from "react-router";
import { useTranslationStore } from "../../hooks/useTranslationStore";

export const FormSections: React.FC<{ sections: TSectionName[] }> = observer(({ sections }) => {
	const { activeSection, setActiveSection, createKeyValuePairs, getSectionByIndex } = useForm();
	const { protocol_id }: { protocol_id: string } = useParams();
	const { t } = useTranslationStore();

	const saveAsDraft = async section => {
		const data = createKeyValuePairs() as TProtocol;
		if (protocol_id) {
			updateProtocolQuery(protocol_id, data);
			setActiveSection(section);
		} else {
			const response = await saveProtocolQuery(data);
			if (response.protocol_id) {
				const protocolId = response.protocol_id;
				const nextSectionIndex = getSectionByIndex(section);
				location.href = `/dashboard/edit-protocol/${protocolId}#${nextSectionIndex}`;
			}
		}
	};

	useEffect(() => {
		if (sections && !location.hash) {
			setActiveSection(sections[0]);
		}
	}, []);

	return (
		<div className="Sections">
			<ul>
				{sections.map((section, idx) => (
					<li
						className={cx({ active: activeSection === section })}
						key={section}
						onClick={() => saveAsDraft(section)}
					>
						{idx + 1}. {t(section)}
					</li>
				))}
			</ul>
		</div>
	);
});
