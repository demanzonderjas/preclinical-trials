import React from "react";
import { ContentBlock } from "../components/layout/ContentBlock";
import { Page } from "../components/layout/Page";
import { usePage } from "../hooks/usePage";

export const ContactPage: React.FC = () => {
	const { page } = usePage();

	return (
		<Page title={page.title}>
			<ContentBlock withBorder>
				<div dangerouslySetInnerHTML={{ __html: page.content_blocks[0].content }} />
			</ContentBlock>
		</Page>
	);
};
