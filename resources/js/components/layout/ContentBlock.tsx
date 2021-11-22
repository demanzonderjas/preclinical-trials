import React from "react";
import cx from "classnames";

export const ContentBlock: React.FC<{ maxWidth?: string; withBorder?: boolean }> = ({
	children,
	maxWidth,
	withBorder
}) => {
	return (
		<div className={cx("ContentBlock", { "with-border": withBorder })}>
			<div className="content" style={{ maxWidth }}>
				{children}
			</div>
		</div>
	);
};
