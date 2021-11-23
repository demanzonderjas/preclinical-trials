import React, { useState } from "react";
import { Image } from "../base/Image";
import cx from "classnames";

export const ExpandableText: React.FC<{ header: string; body: string }> = ({ header, body }) => {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<div className={cx("ExpandableText", { active: isExpanded })}>
			<div className="icon" onClick={() => setIsExpanded(!isExpanded)}>
				<Image filename={isExpanded ? "minus.png" : "plus.png"} />
			</div>
			<strong className="header">{header}</strong>
			<div className="body" dangerouslySetInnerHTML={{ __html: body }} />
		</div>
	);
};