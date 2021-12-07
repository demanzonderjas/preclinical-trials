import React from "react";
import { ContentBlock } from "../ContentBlock";
import { Sidebar } from "./Sidebar";

export const AdminPage: React.FC<{ title: string }> = ({ children, title }) => {
	return (
		<div className="AdminPage" style={{ display: "flex", alignItems: "stretch" }}>
			<Sidebar />
			<div className="PageContent" style={{ flexGrow: 2 }}>
				<ContentBlock maxWidth="50%">
					<h1 style={{ fontSize: "40px", fontWeight: "bold", margin: "20px 0 70px" }}>
						{title}
					</h1>
					{children}
				</ContentBlock>
			</div>
		</div>
	);
};
