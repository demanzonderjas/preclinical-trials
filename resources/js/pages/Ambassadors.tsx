import React, { Suspense } from "react";
import { PageWithSubmenu, PrimaryHeaderPageWithSubMenu } from "../components/layout/Page";
import { aboutUsSubMenu } from "../data/about-us/aboutUsData";
import { usePage } from "../hooks/usePage";
const AmbassadorMap = React.lazy(() => import("./../components/ambassadors/AmbassadorMap"));

export const AmbassadorsPage: React.FC = () => {
	const { page } = usePage();
	return (
		<PrimaryHeaderPageWithSubMenu title={page.title}>
			<PageWithSubmenu subMenu={aboutUsSubMenu}>
				<div dangerouslySetInnerHTML={{ __html: page.content_blocks[0].content }} />
				<Suspense fallback={<div>Loading</div>}>
					<AmbassadorMap />
				</Suspense>
			</PageWithSubmenu>
		</PrimaryHeaderPageWithSubMenu>
	);
};
