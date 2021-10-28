import React from "react";
import { Image } from "../base/Image";

export const LoginButton: React.FC = () => {
	return (
		<div className="LoginButton">
			<div className="content">
				<Image filename="login.png" />
				<span>Login</span>
			</div>
		</div>
	);
};
