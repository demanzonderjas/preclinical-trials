import React from "react";
import { AboutUsBlock } from "../components/layout/AboutUsBlock";
import { Page, PageWithSubmenu, PrimaryHeaderPageWithSubMenu } from "../components/layout/Page";
import { aboutUsData, aboutUsSubMenu } from "../data/about-us/aboutUsData";
import { TAboutUsType } from "../typings/aboutUs";

export const TeamPage: React.FC = () => {
	return (
		<PrimaryHeaderPageWithSubMenu title="Team">
			<PageWithSubmenu subMenu={aboutUsSubMenu}>
				<AboutUsBlock
					title="Daily Directors"
					personList={aboutUsData.filter(p => p.role === TAboutUsType.DailyDirector)}
				/>
				<AboutUsBlock
					title="Steering Committee"
					personList={aboutUsData.filter(p => p.role === TAboutUsType.SteeringCommittee)}
				/>
			</PageWithSubmenu>
		</PrimaryHeaderPageWithSubMenu>
	);
};
