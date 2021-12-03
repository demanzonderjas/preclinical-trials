import React, { useState } from "react";
import { FormBlock } from "../../components/layout/FormBlock";
import { Page } from "../../components/layout/Page";
import { CreateProtocolPanel } from "../../components/protocols/CreateProtocolPanel";
import { ProtocolStoreProvider } from "../../contexts/ProtocolContext";
import { createProtocolForm, protocolSections } from "../../data/forms/protocol";
import { saveProtocolQuery } from "../../queries/protocol";
import { ProtocolStore } from "../../stores/ProtocolStore";

export const AddProtocolPage: React.FC = () => {
	const [protocolStore] = useState(new ProtocolStore());
	return (
		<Page title="Add Protocol">
			<div className="AddProtocol border-top">
				<ProtocolStoreProvider store={protocolStore}>
					<FormBlock
						form={createProtocolForm}
						handleSubmit={saveProtocolQuery}
						icon="add.png"
						sections={protocolSections}
					>
						<CreateProtocolPanel />
					</FormBlock>
				</ProtocolStoreProvider>
			</div>
		</Page>
	);
};
