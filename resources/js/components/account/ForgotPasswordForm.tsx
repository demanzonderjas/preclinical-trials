import React from "react";
import { FormBlock } from "../layout/FormBlock";
import { forgotPasswordForm } from "../../data/forms/login";
import { forgotPasswordQuery } from "../../queries/login";

export const ForgotPasswordForm: React.FC = () => {
	return (
		<FormBlock icon="password.png" form={forgotPasswordForm} handleSubmit={forgotPasswordQuery}>
			<div className="LoginForm">
				<h3>Forgot Password</h3>
			</div>
		</FormBlock>
	);
};
