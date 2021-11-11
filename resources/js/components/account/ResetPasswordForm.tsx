import React from "react";
import { FormBlock } from "../layout/FormBlock";
import { resetPasswordForm } from "../../data/forms/login";
import { resetPasswordQuery } from "../../queries/login";

export const ResetPasswordForm: React.FC = () => {
	return (
		<FormBlock icon="password.png" {...resetPasswordForm} handleSubmit={resetPasswordQuery}>
			<div className="LoginForm">
				<h3>Reset Password</h3>
			</div>
		</FormBlock>
	);
};
