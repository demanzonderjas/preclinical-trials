import React from "react";
import { FormBlock } from "../layout/FormBlock";
import { resetPasswordForm } from "../../data/forms/login";
import { resetPasswordQuery } from "../../queries/user";

export const ResetPasswordForm: React.FC = () => {
	return (
		<FormBlock icon="password.png" form={resetPasswordForm} handleSubmit={resetPasswordQuery}>
			<div className="LoginForm">
				<h3>Reset Password</h3>
			</div>
		</FormBlock>
	);
};
