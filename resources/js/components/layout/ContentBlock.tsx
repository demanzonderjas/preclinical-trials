import React from "react";
import cx from "classnames";
import { Triangle } from "./Triangle";

export const ContentBlock: React.FC<{
	maxWidth?: string;
	withBorder?: boolean;
	padding?: string;
}> = ({ children, maxWidth, withBorder, padding }) => {
	return (
		<div className={cx("ContentBlock", { "with-border": withBorder })}>
			<div
				className="content layout-wrapper"
				style={{
					maxWidth: maxWidth ? `${maxWidth} !important` : null,
					padding: padding || null
				}}
			>
				{children}
			</div>
			<Triangle />
		</div>
	);
};
