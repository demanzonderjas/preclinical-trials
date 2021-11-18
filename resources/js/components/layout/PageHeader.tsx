import React from "react";
import { Highlight } from "./Highlight";
import { LoginButton } from "./LoginButton";
import { Logo } from "./Logo";
import { Menu } from "./Menu";

export const PageHeader: React.FC<{
	title: string;
	subtitle?: string;
	hasCurvedHeader?: boolean;
}> = ({ title, subtitle, hasCurvedHeader }) => {
	return (
		<div className="PageHeader">
			{hasCurvedHeader && (
				<div className="Ellipse">
					<Highlight
						image="note.png"
						text="98 protocols registered already! (25 under embargo)"
					/>
				</div>
			)}
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
