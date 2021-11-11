import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { useForm } from "../../hooks/useForm";
import { TSectionName } from "../../typings/forms";
import cx from "classnames";

export const FormSections: React.FC<{ sections: TSectionName[] }> = observer(({ sections }) => {
	const { activeSection, setActiveSection } = useForm();

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
						onClick={() => setActiveSection(section)}
					>
						{idx + 1}. {section}
					</li>
				))}
			</ul>
		</div>
	);
});
