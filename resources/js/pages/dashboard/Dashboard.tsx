import React from "react";
import { MenuCircleItem } from "../../components/layout/MenuCircleItem";
import { Page } from "../../components/layout/Page";

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
					<MenuCircleItem
						text="Search protocols"
						image="search.png"
						link="dashboard/database"
					/>
					<MenuCircleItem
						text="Add protocol"
						image="add.png"
						link="dashboard/add-protocol"
					/>
					<MenuCircleItem
						text="Manage protocols"
						image="folder.png"
						link="dashboard/manage-protocols"
					/>
				</div>
			</div>
		</Page>
	);
};
