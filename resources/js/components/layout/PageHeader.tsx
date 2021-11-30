import React from "react";
import { THeaderStyle } from "../../typings/layout";
import { Highlight } from "./Highlight";
import { DashboardPanel } from "./DashboardPanel";
import { Logo } from "./Logo";
import { Menu } from "./Menu";
import cx from "classnames";

export const PageHeader: React.FC<{
	title: string;
	subtitle?: string;
	style: THeaderStyle;
}> = ({ title, subtitle, style }) => {
	return (
		<div className={cx("PageHeader", { [style]: true })}>
			<div className="Navigation">
				<Logo />
				<Menu />
			</div>
			<div className="Copy layout-wrapper">
				<h1>{title}</h1>
				{!!subtitle && <h2>{subtitle}</h2>}
			</div>
			<DashboardPanel />
		</div>
	);
};
