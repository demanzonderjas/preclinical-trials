import React from "react";
import { Image } from "../base/Image";
import { FormBlock } from "../layout/FormBlock";
import { Link } from "react-router-dom";

export const LoginForm: React.FC = () => {
	return (
		<FormBlock icon="login.png">
			<div className="LoginForm">
				<h3>Login</h3>
				<form onSubmit={e => e.preventDefault()}>
					<input type="text" placeholder="Email" />
					<input type="password" placeholder="Password" />
					<button type="submit">Go!</button>
				</form>
				<Link to="create-account">
					<div className="NewRegistration">
						<p>Or register as a new user</p>
						<Image filename="new-account.png" />
					</div>
				</Link>
			</div>
		</FormBlock>
	);
};
