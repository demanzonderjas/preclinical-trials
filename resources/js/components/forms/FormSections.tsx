import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { useForm } from "../../hooks/useForm";
import { TFormFieldName, TSectionName } from "../../typings/forms";
import cx from "classnames";
import { saveProtocolQuery, updateProtocolQuery } from "../../queries/protocol";
import { TProtocol } from "../../typings/protocols";
import { useParams } from "react-router";

export const FormSections: React.FC<{ sections: TSectionName[] }> = observer(({ sections }) => {
	const { activeSection, setActiveSection, createKeyValuePairs } = useForm();
	const { protocol_id }: { protocol_id: string } = useParams();

	const saveAsDraft = section => {
		const data = createKeyValuePairs() as TProtocol;
		if (protocol_id) {
			updateProtocolQuery(protocol_id, data);
		} else {
			saveProtocolQuery(data);
		}
		setActiveSection(section);
	};

	useEffect(() => {
		if (sections) {
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
						{idx + 1}. {section}
					</li>
				))}
			</ul>
		</div>
	);
});
