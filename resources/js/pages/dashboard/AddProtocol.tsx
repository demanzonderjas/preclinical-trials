import React from "react";
import { FormBlock } from "../../components/layout/FormBlock";
import { Page } from "../../components/layout/Page";
import { createProtocolForm, protocolSections } from "../../data/forms/protocol";
import { saveProtocolQuery } from "../../queries/protocol";
import { TSectionName } from "../../typings/forms";

export const AddProtocolPage: React.FC = () => {
	return (
		<Page title="Add Protocol">
			<div className="AddProtocol border-top">
				<FormBlock
					form={createProtocolForm}
					handleSubmit={saveProtocolQuery}
					icon="add.png"
					sections={protocolSections}
				>
					<p className="intro">
						Register your study by completing the following form. Notice that the fields
						with an asterisk are mandatory, whereas other fields are optional. Once the
						form is submitted it will be checked before publication on this website.
						Changes made after publication on this site will be recorded with an audit
						trail.
					</p>
				</FormBlock>
			</div>
		</Page>
	);
};
