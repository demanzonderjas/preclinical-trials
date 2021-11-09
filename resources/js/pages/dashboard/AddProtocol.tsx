import React from "react";
import { FormWrapper } from "../../components/forms/FormWrapper";
import { FormBlock } from "../../components/layout/FormBlock";
import { Page } from "../../components/layout/Page";
import { createAccountForm } from "../../data/forms/create-account";
import { createAccountQuery } from "../../queries/account";

export const AddProtocolPage: React.FC = () => {
	return (
		<Page title="Add Protocol">
			<div className="AddProtocol border-top">
				<FormBlock icon="add.png">
					<FormWrapper {...createAccountForm} handleSubmit={createAccountQuery}>
						<p className="intro">
							Register your study by completing the following form. Notice that the
							fields with an asterisk are mandatory, whereas other fields are
							optional. Once the form is submitted it will be checked before
							publication on this website. Changes made after publication on this site
							will be recorded with an audit trail.
						</p>
					</FormWrapper>
				</FormBlock>
			</div>
		</Page>
	);
};
