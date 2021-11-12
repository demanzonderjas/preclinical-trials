import React from "react";
import { Image } from "../base/Image";
import { FormBlock } from "../layout/FormBlock";
import { Link } from "react-router-dom";
import { loginForm } from "../../data/forms/login";
import { loginQuery } from "../../queries/login";
import { useModalStore } from "../../hooks/useModalStore";
import { forgotPasswordModal } from "../../data/modals/loginModal";

export const LoginForm: React.FC = () => {
	const { setModal } = useModalStore();
	return (
		<FormBlock icon="login.png" form={loginForm} handleSubmit={loginQuery}>
			<div className="LoginForm">
				<h3>Login</h3>
			</div>
			<Link to="create-account">
				<div className="NewRegistration" onClick={() => setModal(null)}>
					<p>Or register as a new user</p>
					<Image filename="new-account.png" />
				</div>
			</Link>
			<div className="ForgotPassword">
				<a onClick={() => setModal(forgotPasswordModal)}>Forgot?</a>
			</div>
		</FormBlock>
	);
};
