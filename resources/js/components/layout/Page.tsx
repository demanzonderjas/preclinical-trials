import React from "react";
import { TSubMenuItem } from "../../typings/layout";
import { ContentBlock } from "./ContentBlock";
import { PageFooter } from "./PageFooter";
import { PageHeader } from "./PageHeader";
import { SubMenu } from "./SubMenu";

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

export const PageWithSubmenu: React.FC<{ subMenu: TSubMenuItem[] }> = ({ children, subMenu }) => {
	return (
		<div className="AboutUsPage">
			<div className="PageWithSubMenu">
				<SubMenu items={subMenu} />
				<ContentBlock maxWidth="90%" withBorder={true}>
					{children}
				</ContentBlock>
			</div>
		</div>
	);
};
