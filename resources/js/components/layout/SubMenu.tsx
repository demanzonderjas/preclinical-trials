import React from "react";
import cx from "classnames";
import { TSubMenuItem } from "../../typings/layout";

export const SubMenu: React.FC<{ items: TSubMenuItem[] }> = ({ items }) => {
	return (
		<div className={cx("SubMenu")}>
			<ul>
				{items.map(item => (
					<li key={item.target}>
						<a href={item.target}>{item.text}</a>
					</li>
				))}
			</ul>
		</div>
	);
};
