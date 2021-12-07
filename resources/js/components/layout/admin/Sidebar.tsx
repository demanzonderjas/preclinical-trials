import React from "react";
import { Image } from "../../base/Image";
import { MenuItem } from "../Menu";

export const Sidebar: React.FC = () => {
	return (
		<div className="Sidebar">
			<Image filename="logo-pct.jpeg" />
			<div className="AdminMenu">
				<ul>
					<MenuItem text="Protocols" url="/admin/protocols" />
					<MenuItem text="News" url="/admin/news" />
					<MenuItem text="FAQ" url="/admin/faq" />
					<MenuItem text="Pages" url="/admin/pages" />
					<MenuItem text="Stats" url="/admin/stats" />
				</ul>
			</div>
		</div>
	);
};