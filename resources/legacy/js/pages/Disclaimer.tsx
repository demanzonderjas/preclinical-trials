import React from "react";
import { ContentBlock } from "../components/layout/ContentBlock";
import { Page } from "../components/layout/Page";
import { usePage } from "../hooks/usePage";

export const DisclaimerPage: React.FC = () => {
	const { page } = usePage();
	return (
		<Page title={page.title} subtitle={page.subtitle}>
			<ContentBlock>
				<div
					className="DisclaimerPage"
					dangerouslySetInnerHTML={{ __html: page.content_blocks[0].content }}
				/>
			</ContentBlock>
		</Page>
	);
};
