import React from "react";
import { ContentBlock } from "../components/layout/ContentBlock";
import { FormBlock } from "../components/layout/FormBlock";
import { Page } from "../components/layout/Page";
import { SocialIcons } from "../components/layout/SocialIcons";
import { contactForm } from "../data/forms/contact";
import { usePage } from "../hooks/usePage";
import { saveContactFormQuery } from "../queries/contact";

export const ContactPage: React.FC = () => {
	const { page } = usePage();

	return (
		<Page title={page.title}>
			<div className="ContactPage">
				<ContentBlock withBorder>
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
