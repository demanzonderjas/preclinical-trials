import React from "react";
import {
	PageWithSubmenu,
	PrimaryHeaderPage,
	PrimaryHeaderPageWithSubMenu
} from "../components/layout/Page";
import { aboutUsSubMenu } from "../data/about-us/aboutUsData";
import { usePage } from "../hooks/usePage";

export const AboutPCTPage: React.FC = () => {
	const { page } = usePage();
	return (
		<PrimaryHeaderPageWithSubMenu title={page.title}>
			<PageWithSubmenu subMenu={aboutUsSubMenu}>
				<div dangerouslySetInnerHTML={{ __html: page.content_blocks[0].content }} />
			</PageWithSubmenu>
		</PrimaryHeaderPageWithSubMenu>
	);
};
