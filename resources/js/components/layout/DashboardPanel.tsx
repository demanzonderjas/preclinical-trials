import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { useHistory } from "react-router";
import { loginModal } from "../../data/modals/loginModal";
import { useIsLoggedIn } from "../../hooks/useLogin";
import { useModalStore } from "../../hooks/useModalStore";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { logoutQuery } from "../../queries/login";
import { Image } from "../base/Image";

export const DashboardPanel: React.FC = observer(() => {
	const { setModal } = useModalStore();
	const isLoggedIn = useIsLoggedIn();
	const { push } = useHistory();
	const { t } = useTranslationStore();

	const logout = async () => {
		await logoutQuery();
		location.href = "/";
	};

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		if (params.has("login_to") && !isLoggedIn) {
			setModal(loginModal);
		} else {
			setModal(null);
		}
	}, [isLoggedIn]);

	return (
		<div className="DashboardPanel">
			<div className="LoginButton" onClick={isLoggedIn ? logout : () => setModal(loginModal)}>
				<div className="content">
					<Image filename={isLoggedIn ? "logout.png" : "login.png"} />
					<span>{isLoggedIn ? "Logout" : "Login"}</span>
				</div>
			</div>
			{isLoggedIn && (
				<div className="DashboardMenu">
					<div className="item" onClick={() => push("/dashboard")}>
						<span>{t("dashboard")}</span>
					</div>
					<div className="item" onClick={() => push("/dashboard/add-protocol")}>
						<span>{t("add_protocol")}</span>
					</div>
				</div>
			)}
		</div>
	);
});
