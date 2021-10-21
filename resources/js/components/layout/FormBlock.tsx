import React from "react";
import { Image } from "../base/Image";

export const FormBlock: React.FC<{ icon: string }> = ({ children, icon }) => {
	return (
		<div className="FormBlock">
			<div className="icon-wrapper">
				<Image filename={icon} />
			</div>
			{children}
		</div>
	);
};
