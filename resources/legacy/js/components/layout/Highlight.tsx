import React from "react";
import { useHistory } from "react-router";
import { Image } from "../base/Image";

export const Highlight: React.FC<{ text: string; image: string }> = ({ text, image }) => {
	const { push } = useHistory();
	return (
		<div className="Highlight" onClick={() => push("/database")}>
			<div className="copy">
				<p>{text}</p>
				<Image filename={image} />
			</div>
		</div>
	);
};
