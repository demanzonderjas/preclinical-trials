import React from "react";
import { Image } from "../base/Image";

export const MenuCircleItem: React.FC<{ text: string; image: string }> = ({ text, image }) => {
	return (
		<div className="MenuCircleItem">
			<div className="content">
				<Image filename={image} />
				<p>{text}</p>
			</div>
		</div>
	);
};
