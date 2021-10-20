import React from "react";
import { Image } from "../base/Image";

export const Highlight: React.FC<{ text: string; image: string }> = ({ text, image }) => {
	return (
		<div className="Highlight">
			<div className="copy">
				<p>{text}</p>
				<Image filename={image} />
			</div>
		</div>
	);
};
