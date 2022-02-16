import React, { useEffect, useRef, useState } from "react";
import { ContentBlock } from "../components/layout/ContentBlock";
import { FormBlock } from "../components/layout/FormBlock";
import { Page } from "../components/layout/Page";
import { SocialIcons } from "../components/layout/SocialIcons";
import { contactForm } from "../data/forms/contact";
import { usePage } from "../hooks/usePage";
import { useTranslationStore } from "../hooks/useTranslationStore";
import { saveContactFormQuery } from "../queries/contact";

export const ContactPage: React.FC = () => {
	const { page } = usePage();
	const { t } = useTranslationStore();

	return (
		<Page title={page.title}>
			<div className="ContactPage">
				<ContentBlock withBorder>
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
					<FormBlock
						icon="note.png"
						form={contactForm}
						handleSubmit={saveContactFormQuery}
					></FormBlock>
					<div
						dangerouslySetInnerHTML={{ __html: page.content_blocks[0].content }}
						style={{ textAlign: "center" }}
					/>
					<div className="social-icons">
						<SocialIcons />
					</div>
				</ContentBlock>
			</div>
		</Page>
	);
};
