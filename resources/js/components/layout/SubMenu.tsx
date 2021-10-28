import React from "react";
import { slugify } from "../../utils/formatting";

export const SubMenu: React.FC<{ items: string[] }> = ({ items }) => {
	return (
		<div className="SubMenu">
			<ul>
				{items.map(item => (
					<li key={item}>
						<a href={`#${slugify(item)}`}>{item}</a>
					</li>
				))}
			</ul>
		</div>
	);
};
