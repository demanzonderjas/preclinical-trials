import React from "react";
import { THeaderStyle, TSubMenuItem } from "../../typings/layout";
import { ContentBlock } from "./ContentBlock";
import { PageFooter } from "./PageFooter";
import { PageHeader } from "./PageHeader";
import { SubMenu } from "./SubMenu";

export const Page: React.FC<{ title: string; subtitle?: string; headerStyle?: THeaderStyle }> = ({
	children,
	title,
	subtitle,
	headerStyle = THeaderStyle.White
}) => {
	return (
		<div className="Page">
			<PageHeader title={title} subtitle={subtitle} style={headerStyle} />
			<div className="PageContent">{children}</div>
			<PageFooter />
		</div>
	);
};

export const PrimaryHeaderPageWithSubMenu: React.FC<{
	children;
	title: string;
	subtitle?: string;
}> = ({ children, ...props }) => {
	return (
		<Page {...props} headerStyle={THeaderStyle.PrimaryWithSubMenu}>
			{children}
		</Page>
	);
};

export const PrimaryHeaderPage: React.FC<{ children; title: string; subtitle?: string }> = ({
	children,
	...props
}) => {
	return (
		<Page {...props} headerStyle={THeaderStyle.Primary}>
			{children}
		</Page>
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
