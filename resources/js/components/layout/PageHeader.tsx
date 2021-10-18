import React from "react";
import { Logo } from "./Logo";
import { Menu } from "./Menu";

export const PageHeader: React.FC = () => {
	return (
		<div className="PageHeader">
			<div className="Navigation">
				<Logo />
				<Menu />
			</div>
		</div>
	);
};
