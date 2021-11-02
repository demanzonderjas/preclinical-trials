import React from "react";
import { useModalStore } from "../../hooks/useModalStore";
import { logoutQuery } from "../../queries/login";
import { Image } from "../base/Image";

export const LoginButton: React.FC = () => {
	const { setModal } = useModalStore();
	return (
		<div className="LoginButton" onClick={() => logoutQuery()}>
			<div className="content">
				<Image filename="login.png" />
				<span>Login</span>
			</div>
		</div>
	);
};
