import React from "react";
import { loginModal } from "../../data/modals/loginModal";
import { useIsLoggedIn } from "../../hooks/useLogin";
import { useModalStore } from "../../hooks/useModalStore";
import { logoutQuery } from "../../queries/login";
import { getMeta } from "../../utils/api";
import { Image } from "../base/Image";

export const LoginButton: React.FC = () => {
	const { setModal } = useModalStore();
	const isLoggedIn = useIsLoggedIn();

	const logout = async () => {
		await logoutQuery();
		location.reload();
	};

	return (
		<div className="LoginButton" onClick={isLoggedIn ? logout : () => setModal(loginModal)}>
			<div className="content">
				<Image filename="login.png" />
				<span>{isLoggedIn ? "Logout" : "Login"}</span>
			</div>
		</div>
	);
};
