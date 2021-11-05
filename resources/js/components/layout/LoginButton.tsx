import React from "react";
import { loginModal } from "../../data/modals/loginModal";
import { useModalStore } from "../../hooks/useModalStore";
import { logoutQuery } from "../../queries/login";
import { getMeta } from "../../utils/api";
import { Image } from "../base/Image";

export const LoginButton: React.FC = () => {
	const { setModal } = useModalStore();
	const sessionId = getMeta("session-id");

	const logout = async () => {
		await logoutQuery();
		location.reload();
	};

	return (
		<div className="LoginButton" onClick={sessionId ? logout : () => setModal(loginModal)}>
			<div className="content">
				<Image filename="login.png" />
				<span>{sessionId ? "Logout" : "Login"}</span>
			</div>
		</div>
	);
};
