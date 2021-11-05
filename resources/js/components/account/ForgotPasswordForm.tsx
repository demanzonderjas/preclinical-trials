import React from "react";
import { Image } from "../base/Image";
import { FormBlock } from "../layout/FormBlock";
import { FormWrapper } from "../forms/FormWrapper";
import { useModalStore } from "../../hooks/useModalStore";
import { forgotPasswordForm } from "../../data/forms/login";
import { forgotPasswordQuery } from "../../queries/login";

export const ForgotPasswordForm: React.FC = () => {
	const { setModal } = useModalStore();
	return (
		<FormBlock icon="password.png">
			<FormWrapper {...forgotPasswordForm} handleSubmit={forgotPasswordQuery}>
				<div className="LoginForm">
					<h3>Forgot Password</h3>
				</div>
			</FormWrapper>
		</FormBlock>
	);
};
