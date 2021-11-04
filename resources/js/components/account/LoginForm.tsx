import React from "react";
import { Image } from "../base/Image";
import { FormBlock } from "../layout/FormBlock";
import { Link } from "react-router-dom";
import { FormWrapper } from "../forms/FormWrapper";
import { loginForm } from "../../data/forms/login";
import { loginQuery } from "../../queries/login";
import { useModalStore } from "../../hooks/useModalStore";

export const LoginForm: React.FC = () => {
	const { setModal } = useModalStore();
	return (
		<FormBlock icon="login.png">
			<FormWrapper {...loginForm} handleSubmit={loginQuery}>
				<div className="LoginForm">
					<h3>Login</h3>
				</div>
			</FormWrapper>
			<Link to="create-account">
				<div className="NewRegistration" onClick={() => setModal(null)}>
					<p>Or register as a new user</p>
					<Image filename="new-account.png" />
				</div>
			</Link>
		</FormBlock>
	);
};
