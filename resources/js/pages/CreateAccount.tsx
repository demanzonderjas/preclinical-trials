import React from "react";
import { FormBlock } from "../components/layout/FormBlock";
import { Page } from "../components/layout/Page";
import { createAccountForm } from "../data/forms/create-account";
import { createAccountQuery } from "../queries/account";

export const CreateAccountPage: React.FC = () => {
	return (
		<Page title="Create Account">
			<div className="CreateAccount border-top">
				<FormBlock
					icon="new-account.png"
					form={createAccountForm}
					handleSubmit={createAccountQuery}
				>
					<p className="intro">
						You need a user account to use this site. Please enter your details below
						and we will send you a confirmation email to give you access to
						Preclinicaltrials.eu
					</p>
				</FormBlock>
			</div>
		</Page>
	);
};
