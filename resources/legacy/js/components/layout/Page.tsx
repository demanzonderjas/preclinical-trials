import React, { useEffect } from "react";
import { THeaderStyle, TSubMenu, TSubMenuItem } from "../../typings/layout";
import { ContentBlock } from "./ContentBlock";
import { PageFooter } from "./PageFooter";
import { PageHeader } from "./PageHeader";
import { SubMenu } from "./SubMenu";
import { observer } from "mobx-react-lite";
import { useUser } from "../../hooks/useUser";

export const Page: React.FC<{
	title: string;
	subtitle?: string;
	headerStyle?: THeaderStyle;
	needsVerification?: boolean;
}> = observer(
	({ children, title, needsVerification, subtitle, headerStyle = THeaderStyle.White }) => {
		const { user } = useUser();

		useEffect(() => {
			if (user && !user.is_verified && needsVerification) {
				location.href = "/verify-email";
			}
		}, [user]);

		return (
			<div className="Page">
				<PageHeader title={title} subtitle={subtitle} style={headerStyle} />
				<div className="PageContent">{children}</div>
				<PageFooter />
			</div>
		);
	}
);

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

export const PageWithSubmenu: React.FC<{ subMenu: TSubMenu }> = ({ children, subMenu }) => {
	return (
		<div className="AboutUsPage">
			<div className="PageWithSubMenu">
				<SubMenu {...subMenu} />
				<ContentBlock maxWidth="90%" withBorder={true}>
					{children}
				</ContentBlock>
			</div>
		</div>
	);
};
