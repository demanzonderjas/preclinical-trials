import React from "react";
import cx from "classnames";

export const ContentBlock: React.FC<{ withMargin?: boolean; maxWidth?: string }> = ({
	children,
	withMargin,
	maxWidth
}) => {
	return (
		<div className={cx("ContentBlock", { "with-margin": withMargin })}>
			<div className="content" style={{ maxWidth }}>
				{children}
			</div>
		</div>
	);
};
