import React from "react";
import cx from "classnames";

export const ContentBlock: React.FC<{ maxWidth?: string }> = ({ children, maxWidth }) => {
	return (
		<div className={cx("ContentBlock")}>
			<div className="content" style={{ maxWidth }}>
				{children}
			</div>
		</div>
	);
};
