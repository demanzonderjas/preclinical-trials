import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { ContentBlock } from "../components/layout/ContentBlock";
import { Page } from "../components/layout/Page";
import { ProtocolSection } from "../components/protocols/ProtocolSection";
import { RevisionPanel } from "../components/protocols/RevisionPanel";
import { RevisionStoreProvider } from "../contexts/RevisionStoreContext";
import { protocolSections } from "../data/forms/protocol";
import { getProtocolQuery, saveProtocolQuery, updateProtocolQuery } from "../queries/protocol";
import { RevisionStore } from "../stores/RevisionStore";
import { TDBProtocol, TProtocol } from "../typings/protocols";
import { fillFieldsWithProtocolDetails } from "../utils/protocol";

export const ViewProtocolPage: React.FC = () => {
	const { protocol_id }: { protocol_id: string } = useParams();
	const [protocol, setProtocol] = useState<TDBProtocol>(null);
	const [revisionStore, setRevisionStore] = useState<RevisionStore>(null);

	useEffect(() => {
		if (protocol_id) {
			(async () => {
				const response = await getProtocolQuery(protocol_id);
				const data = response.protocol as TDBProtocol;
				setProtocol(data);
				setRevisionStore(new RevisionStore(data));
			})();
		}
	}, [protocol_id]);

	const fieldsWithValues = fillFieldsWithProtocolDetails(protocol);

	return (
		<RevisionStoreProvider store={revisionStore}>
			<Page title="View Protocol">
				<div className="ViewProtocol border-top">
					<ContentBlock maxWidth="90%">
						<div className="protocol">
							{protocolSections.slice(0, -1).map((section, idx) => (
								<ProtocolSection
									key={section}
									name={section}
									fields={fieldsWithValues.filter(f => f.section === section)}
									shouldBeOpen={idx === 0}
								/>
							))}
							<RevisionPanel />
						</div>
					</ContentBlock>
				</div>
			</Page>
		</RevisionStoreProvider>
	);
};
