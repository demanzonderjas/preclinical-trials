import React from "react";
import { useTranslationStore } from "../../hooks/useTranslationStore";

export const AppointmentButton: React.FC = () => {
	const { t } = useTranslationStore();

	return (
		<div
			className="layout-wrapper"
			style={{
				display: "flex",
				justifyContent: "center",
				flexWrap: "wrap",
				background: "#f0f0f0",
				padding: "20px"
			}}
		>
			<p style={{ width: "100%", textAlign: "center" }}>
				{t("click_button_to_set_up_an_appointment")}
			</p>
			<button
				type="button"
				className="tertiary"
				style={{
					filter: "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.65)",
					border: "1px solid rgba(0, 0, 0, 0.65)"
				}}
				onClick={() =>
					window.open(
						"https://preclinicaltrialseu.simplybook.it/v2/#book",
						"_blank",
						"noreferrer noopener"
					)
				}
			>
				{t("set_up_an_appointment")}
			</button>
		</div>
	);
};
