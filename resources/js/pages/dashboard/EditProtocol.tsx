import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { FormBlock } from "../../components/layout/FormBlock";
import { Page } from "../../components/layout/Page";
import { CreateProtocolPanel } from "../../components/protocols/CreateProtocolPanel";
import { ProtocolStatus } from "../../components/protocols/ProtocolStatus";
import { ProtocolStoreProvider } from "../../contexts/ProtocolContext";
import { createProtocolForm, protocolSections } from "../../data/forms/protocol";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { getProtocolQuery, updateProtocolQuery } from "../../queries/protocol";
import { ProtocolStore } from "../../stores/ProtocolStore";
import { TProtocol } from "../../typings/protocols";

export const EditProtocolPage: React.FC = () => {
	const { protocol_id }: { protocol_id: string } = useParams();
	const [protocol, setProtocol] = useState(null);
	const [protocolStore] = useState(new ProtocolStore(protocol_id));
	const { t } = useTranslationStore();

	useEffect(() => {
		if (protocol_id) {
			(async () => {
				const response = await getProtocolQuery(protocol_id);
				const data = response.protocol as TProtocol;
				setProtocol(data);
			})();
		}
	}, [protocol_id]);

	const updateProtocol = data => {
		return updateProtocolQuery(protocol_id, data);
	};

	console.log(protocol);

	return (
		<Page title="Edit Protocol">
			<div className="AddProtocol border-top">
				<ProtocolStoreProvider store={protocolStore}>
					<ProtocolStatus />
					<FormBlock
						form={createProtocolForm}
						waitForData={true}
						initialData={protocol?.details}
						handleSubmit={updateProtocol}
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
