import React from "react";
import { PrimaryHeaderPageWithSubMenu, PageWithSubmenu } from "../components/layout/Page";
import { helpSubMenu } from "../data/help/helpData";

export const HelpPage: React.FC = () => {
	return (
		<PrimaryHeaderPageWithSubMenu title="Help">
			<PageWithSubmenu subMenu={helpSubMenu} />
			<div className="HelpPage"></div>
		</PrimaryHeaderPageWithSubMenu>
	);
};
