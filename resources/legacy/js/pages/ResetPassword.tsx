import React from "react";
import { FormBlock } from "../components/layout/FormBlock";
import { Page } from "../components/layout/Page";
import { resetPasswordForm } from "../data/forms/login";
import { resetPasswordQuery } from "../queries/user";

export const ResetPasswordPage: React.FC = () => {
	return (
		<Page title="Reset Password">
			<div className="ResetPassword border-top">
				<FormBlock
					icon="password.png"
					form={resetPasswordForm}
					handleSubmit={resetPasswordQuery}
				>
					<p className="intro">You can create a new password below.</p>
				</FormBlock>
			</div>
		</Page>
	);
};
