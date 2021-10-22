import React from "react";
import { FormWrapper } from "../components/forms/FormWrapper";
import { FormBlock } from "../components/layout/FormBlock";
import { Page } from "../components/layout/Page";
import { createAccountForm } from "../data/forms/create-account";

export const CreateAccountPage: React.FC = () => {
	const handleSubmit = data => {
		console.log("data?", data);
	};

	return (
		<Page title="Create Account">
			<div className="CreateAccount border-top">
				<FormBlock icon="new-account.png">
					<FormWrapper {...createAccountForm} handleSubmit={handleSubmit}>
						<p className="intro">
							You need a user account to use this site. Please enter your details
							below and we will send you a confirmation email to give you access to
							Preclinicaltrials.eu
						</p>
					</FormWrapper>
				</FormBlock>
			</div>
		</Page>
	);
};
