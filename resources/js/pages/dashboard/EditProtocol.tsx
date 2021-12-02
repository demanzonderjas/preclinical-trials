import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { FormBlock } from "../../components/layout/FormBlock";
import { Page } from "../../components/layout/Page";
import { CreateProtocolPanel } from "../../components/protocols/CreateProtocolPanel";
import { createProtocolForm, protocolSections } from "../../data/forms/protocol";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { getProtocolQuery, updateProtocolQuery } from "../../queries/protocol";
import { TProtocol } from "../../typings/protocols";

export const EditProtocolPage: React.FC = () => {
	const { protocol_id }: { protocol_id: string } = useParams();
	const [protocol, setProtocol] = useState(null);
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
				<div className="Status">
					<span>
						{t("current_status")}: {t(protocol?.status)}
					</span>
				</div>
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
			</div>
		</Page>
	);
};
