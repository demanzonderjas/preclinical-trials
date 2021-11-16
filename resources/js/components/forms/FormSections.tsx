import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { useForm } from "../../hooks/useForm";
import { TFormFieldName, TSectionName } from "../../typings/forms";
import cx from "classnames";
import { saveProtocolQuery } from "../../queries/protocol";

export const FormSections: React.FC<{ sections: TSectionName[] }> = observer(({ sections }) => {
	const { activeSection, setActiveSection, createKeyValuePairs } = useForm();

	const saveAsDraft = section => {
		const data = createKeyValuePairs();
		saveProtocolQuery(data as { [K in TFormFieldName]: string });
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
