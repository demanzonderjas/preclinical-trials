import React from "react";
import { Image } from "../base/Image";
import { FormBlock } from "../layout/FormBlock";
import { Link } from "react-router-dom";
import { FormWrapper } from "../forms/FormWrapper";
import { loginForm } from "../../data/forms/login";

export const LoginForm: React.FC = () => {
	const handleSubmit = data => {
		console.log("data?", data);
	};

	return (
		<FormBlock icon="login.png">
			<FormWrapper {...loginForm} handleSubmit={handleSubmit}>
				<div className="LoginForm">
					<h3>Login</h3>
				</div>
			</FormWrapper>
			<Link to="create-account">
				<div className="NewRegistration">
					<p>Or register as a new user</p>
					<Image filename="new-account.png" />
				</div>
			</Link>
		</FormBlock>
	);
};
