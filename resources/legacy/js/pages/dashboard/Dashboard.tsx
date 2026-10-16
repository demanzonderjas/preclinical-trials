import { observer } from "mobx-react-lite";
import React from "react";
import { MenuCircleItem } from "../../components/layout/MenuCircleItem";
import { Page } from "../../components/layout/Page";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { useUser } from "../../hooks/useUser";

export const DashboardPage: React.FC = observer(() => {
	const { user } = useUser();
	const { t } = useTranslationStore();

	return (
		<Page title="Dashboard" needsVerification={true}>
			<div className="Dashboard border-top">
				{user && (
					<div className="UserBar">
						{t("welcome")} {user.first_name}
					</div>
				)}
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
					<MenuCircleItem text="Messages" image="note.png" link="dashboard/messages" />
					<MenuCircleItem
						text="My profile"
						image="account.png"
						link="dashboard/profile"
					/>
				</div>
			</div>
		</Page>
	);
});
