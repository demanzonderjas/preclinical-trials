import React from "react";
import { PageFooter } from "./PageFooter";
import { PageHeader } from "./PageHeader";

export const Page: React.FC<{ title: string; subtitle?: string; hasCurvedHeader?: boolean }> = ({
	children,
	title,
	subtitle,
	hasCurvedHeader
}) => {
	return (
		<div className="Page">
			<PageHeader title={title} subtitle={subtitle} hasCurvedHeader={hasCurvedHeader} />
			<div className="PageContent">{children}</div>
			<PageFooter />
		</div>
	);
};
