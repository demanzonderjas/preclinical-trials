import React from "react";
import { FormBlock } from "../layout/FormBlock";
import { FormWrapper } from "../forms/FormWrapper";
import { resetPasswordForm } from "../../data/forms/login";
import { resetPasswordQuery } from "../../queries/login";

export const ResetPasswordForm: React.FC = () => {
	return (
		<FormBlock icon="password.png">
			<FormWrapper {...resetPasswordForm} handleSubmit={resetPasswordQuery}>
				<div className="LoginForm">
					<h3>Reset Password</h3>
				</div>
			</FormWrapper>
		</FormBlock>
	);
};
