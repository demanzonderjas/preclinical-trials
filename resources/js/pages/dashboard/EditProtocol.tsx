import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { FormBlock } from "../../components/layout/FormBlock";
import { Page } from "../../components/layout/Page";
import { CreateProtocolPanel } from "../../components/protocols/CreateProtocolPanel";
import { ProtocolStatus } from "../../components/protocols/ProtocolStatus";
import { ProtocolStoreProvider } from "../../contexts/ProtocolContext";
import {
	createProtocolForm,
	editPublishedProtocolForm,
	protocolSections
} from "../../data/forms/protocol";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { getProtocolQuery, updateProtocolQuery } from "../../queries/protocol";
import { ProtocolStore } from "../../stores/ProtocolStore";
import { TDBProtocol, TProtocol, TProtocolStatus } from "../../typings/protocols";

export const EditProtocolPage: React.FC = () => {
	const { protocol_id }: { protocol_id: string } = useParams();
	const [protocol, setProtocol] = useState<TDBProtocol>(null);
	const [protocolStore] = useState(new ProtocolStore(protocol_id));

	useEffect(() => {
		if (protocol_id) {
			(async () => {
				const response = await getProtocolQuery(protocol_id);
				const data = response.protocol as TDBProtocol;
				setProtocol(data);
			})();
		}
	}, [protocol_id]);

	const updateProtocol = data => {
		return updateProtocolQuery(protocol_id, data);
	};

	return (
		<Page title="Edit Protocol">
			<div className="AddProtocol border-top">
				<ProtocolStoreProvider store={protocolStore}>
					<ProtocolStatus />
					{protocol && (
						<FormBlock
							form={
								protocol.status === TProtocolStatus.Published
									? editPublishedProtocolForm
									: createProtocolForm
							}
							waitForData={true}
							initialData={protocol?.details}
							handleSubmit={updateProtocol}
							icon="edit.png"
							sections={
								protocol.status === TProtocolStatus.Published
									? null
									: protocolSections
							}
						>
							<CreateProtocolPanel
								hideIntro={protocol.status === TProtocolStatus.Published}
							/>
						</FormBlock>
					)}
				</ProtocolStoreProvider>
			</div>
		</Page>
	);
};
