import React from "react";
import { Image } from "../base/Image";
import { useHistory } from "react-router-dom";
import { env } from "../../env";

export const MenuCircleItem: React.FC<{ text: string; image: string; link: string }> = ({
	text,
	image,
	link
}) => {
	const history = useHistory();
	return (
		<div className="MenuCircleItem" onClick={() => history.push(`${link}`)}>
			<div className="content">
				<Image filename={image} />
				<p>{text}</p>
			</div>
		</div>
	);
};
