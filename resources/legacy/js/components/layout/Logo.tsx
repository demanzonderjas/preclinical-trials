import React from "react";
import { Link } from "react-router-dom";
import { Image } from "../base/Image";

export const Logo: React.FC = () => {
	return (
		<div className="LogoWrapper">
			<Link to="/">
				<Image filename="logo-pct.jpg" />
			</Link>
		</div>
	);
};
