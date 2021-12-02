import React from "react";
import cx from "classnames";
import { TSubMenu } from "../../typings/layout";

export const SubMenu: React.FC<TSubMenu> = ({ items, handleClick }) => {
	return (
		<div className={cx("SubMenu")}>
			<ul>
				{items.map(item => (
					<li key={item.target}>
						<a
							href={handleClick ? "#" : item.target}
							onClick={handleClick ? () => handleClick(item.target) : undefined}
						>
							{item.text}
						</a>
					</li>
				))}
			</ul>
		</div>
	);
};
