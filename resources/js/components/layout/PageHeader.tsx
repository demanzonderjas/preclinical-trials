import React from "react";
import { Logo } from "./Logo";
import { Menu } from "./Menu";

export const PageHeader: React.FC<{
	title: string;
	subtitle?: string;
	hasCurvedHeader?: boolean;
}> = ({ title, subtitle, hasCurvedHeader }) => {
	return (
		<div className="PageHeader">
			{hasCurvedHeader && <div className="Ellipse"></div>}
			<div className="Navigation">
				<Logo />
				<Menu />
			</div>
			<div className="Copy">
				<h1>{title}</h1>
				{!!subtitle && <h2>{subtitle}</h2>}
			</div>
		</div>
	);
};
