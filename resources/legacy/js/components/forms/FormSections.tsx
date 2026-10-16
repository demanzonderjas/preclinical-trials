import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { useForm } from "../../hooks/useForm";
import { TFormFieldName, TSectionName } from "../../typings/forms";
import cx from "classnames";
import { useTranslationStore } from "../../hooks/useTranslationStore";

export const FormSections: React.FC<{ sections: TSectionName[] }> = observer(({ sections }) => {
	const { activeSection, setActiveSection } = useForm();
	const { t } = useTranslationStore();

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
						onClick={() => setActiveSection(section)}
					>
						{idx + 1}. {t(section)}
					</li>
				))}
			</ul>
		</div>
	);
});
