import React from "react";
import { Highlight } from "./Highlight";
import { LoginButton } from "./LoginButton";
import { Logo } from "./Logo";
import { Menu } from "./Menu";

export const PageHeader: React.FC<{
	title: string;
	subtitle?: string;
}> = ({ title, subtitle }) => {
	return (
		<div className="PageHeader">
			<div className="Navigation">
				<Logo />
				<Menu />
			</div>
			<div className="Copy">
				<h1>{title}</h1>
				{!!subtitle && <h2>{subtitle}</h2>}
			</div>
			<LoginButton />
		</div>
	);
};
