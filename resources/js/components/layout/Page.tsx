import React from "react";
import { PageFooter } from "./PageFooter";
import { PageHeader } from "./PageHeader";

export const Page: React.FC<{ title: string; subtitle?: string }> = ({
	children,
	title,
	subtitle
}) => {
	return (
		<div className="Page">
			<PageHeader title={title} subtitle={subtitle} />
			<div className="PageContent">{children}</div>
			<PageFooter />
		</div>
	);
};
