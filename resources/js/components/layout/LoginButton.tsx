import React from "react";
import { loginModal } from "../../data/modals/loginModal";
import { useModalStore } from "../../hooks/useModalStore";
import { Image } from "../base/Image";

export const LoginButton: React.FC = () => {
	const { setModal } = useModalStore();
	return (
		<div className="LoginButton" onClick={() => setModal(loginModal)}>
			<div className="content">
				<Image filename="login.png" />
				<span>Login</span>
			</div>
		</div>
	);
};
