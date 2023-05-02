import React from "react";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { TFormFieldName } from "../../typings/forms";

export const FC3RModal: React.FC<{ data: any }> = ({ data }) => {
	const { t } = useTranslationStore();
	const { errors }: { errors: Map<TFormFieldName, any> } = data;

	return (
		<div
			className="PRISModal"
			style={{ fontSize: "20px", lineHeight: "25px", maxWidth: "80%", margin: "0 auto" }}
		>
			<p style={{ color: "white " }}>{t("fc3r_import_description")}</p>
			<ul>
				{[...errors.keys()].map(fieldName => (
					<li key={fieldName} style={{ color: "white" }}>
						{t(fieldName)}
					</li>
				))}
			</ul>
		</div>
	);
};