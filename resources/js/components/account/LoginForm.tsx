import React from "react";
import { Image } from "../base/Image";

export const LoginForm: React.FC = () => {
	return (
		<div className="LoginForm">
			<div className="icon-wrapper">
				<Image filename="login.png" />
			</div>
			<h3>Login</h3>
			<form onSubmit={e => e.preventDefault()}>
				<input type="text" placeholder="Email" />
				<input type="password" placeholder="Password" />
				<button type="submit">Go!</button>
			</form>
			<div className="NewRegistration">
				<p>Or register as a new user</p>
				<Image filename="new-account.png" />
			</div>
		</div>
	);
};
