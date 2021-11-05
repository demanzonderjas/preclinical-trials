import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { slugify } from "../../utils/formatting";
import cx from "classnames";

export const SubMenu: React.FC<{ items: string[] }> = ({ items }) => {
	return (
		<div className={cx("SubMenu")}>
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
