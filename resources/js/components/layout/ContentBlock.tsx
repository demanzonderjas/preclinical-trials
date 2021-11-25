import React from "react";
import cx from "classnames";

export const ContentBlock: React.FC<{ maxWidth?: string; withBorder?: boolean }> = ({
	children,
	maxWidth,
	withBorder
}) => {
	return (
		<div className={cx("ContentBlock", { "with-border": withBorder })}>
			<div className="content layout-wrapper" style={{ maxWidth }}>
				{children}
			</div>
		</div>
	);
};
