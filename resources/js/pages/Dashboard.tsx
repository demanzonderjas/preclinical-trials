import React from "react";
import { MenuCircleItem } from "../components/layout/MenuCircleItem";
import { Page } from "../components/layout/Page";

export const DashboardPage: React.FC = () => {
	return (
		<Page title="Dashboard">
			<div className="Dashboard border-top">
				<div
					className="DashboardItems"
					style={{
						display: "flex",
						justifyContent: "center",
						margin: "50px 0",
						flexWrap: "wrap"
					}}
				>
					<MenuCircleItem text="Search protocols" image="search.png" />
					<MenuCircleItem text="Add protocol" image="add.png" />
					<MenuCircleItem text="Manage protocols" image="folder.png" />
				</div>
			</div>
		</Page>
	);
};
