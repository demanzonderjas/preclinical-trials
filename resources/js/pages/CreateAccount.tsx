import React from "react";
import { FormBlock } from "../components/layout/FormBlock";
import { Page } from "../components/layout/Page";

export const CreateAccountPage: React.FC = () => {
	return (
		<Page title="Create Account">
			<div className="CreateAccount border-top">
				<FormBlock icon="new-account.svg">
					<form>
						<p className="intro">
							You need a user account to use this site. Please enter your details
							below and we will send you a confirmation email to give you access to
							Preclinicaltrials.eu
						</p>
					</form>
				</FormBlock>
			</div>
		</Page>
	);
};
