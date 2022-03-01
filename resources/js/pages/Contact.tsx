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
						dangerouslySetInnerHTML={{ __html: page.content_blocks[0].content }}
						style={{ textAlign: "center" }}
					/>
					<FormBlock
						icon="note.png"
						form={contactForm}
						handleSubmit={saveContactFormQuery}
					></FormBlock>
					<div className="social-icons">
						<SocialIcons />
					</div>
				</ContentBlock>
			</div>
		</Page>
	);
};
