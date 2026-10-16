import React from "react";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { TFormFieldName } from "../../typings/forms";

export const PRISModal: React.FC<{ data: any }> = ({ data }) => {
	const { t } = useTranslationStore();
	const { errors }: { errors: Map<TFormFieldName, any> } = data;

	return (
		<div
			className="PRISModal"
			style={{
				fontSize: "20px",
				padding: "20px 0",
				lineHeight: "25px",
				maxWidth: "80%",
				margin: "0 auto"
			}}
		>
			<p style={{ color: "white " }}>{t("make_sure_to_check_following_fields")}</p>
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
