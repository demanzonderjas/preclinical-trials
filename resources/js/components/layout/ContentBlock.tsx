import React from "react";
import cx from "classnames";
import { Triangle } from "./Triangle";

export const ContentBlock: React.FC<{
	maxWidth?: string;
	withBorder?: boolean;
	padding?: string;
}> = ({ children, maxWidth = "1100px", withBorder, padding }) => {
	return (
		<div className={cx("ContentBlock", { "with-border": withBorder })}>
			<div
				className="content"
				style={{
					maxWidth: maxWidth,
					padding: padding || null
				}}
			>
				{children}
			</div>
			<Triangle />
		</div>
	);
};
