import React from "react";
import { FormBlock } from "../../components/layout/FormBlock";
import { Page } from "../../components/layout/Page";
import { CreateProtocolPanel } from "../../components/protocols/CreateProtocolPanel";
import { ImportPRIS } from "../../components/protocols/ImportPRIS";
import { createProtocolForm, protocolSections } from "../../data/forms/protocol";
import { saveProtocolQuery } from "../../queries/protocol";

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
					<CreateProtocolPanel />
				</FormBlock>
			</div>
		</Page>
	);
};
