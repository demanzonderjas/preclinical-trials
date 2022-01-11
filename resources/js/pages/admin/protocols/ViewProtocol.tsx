import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { ApproveButton, RejectButton } from "../../../components/admin/ActionButtons";
import { AdminPage } from "../../../components/layout/admin/AdminPage";
import { FlexWrapper } from "../../../components/layout/FlexWrapper";
import { ProtocolSection } from "../../../components/protocols/ProtocolSection";
import { RevisionPanel } from "../../../components/protocols/RevisionPanel";
import { RevisionStoreProvider } from "../../../contexts/RevisionStoreContext";
import { protocolSections } from "../../../data/forms/protocol";
import { getProtocolQuery } from "../../../queries/protocol";
import { RevisionStore } from "../../../stores/RevisionStore";
import { TDBProtocol } from "../../../typings/protocols";
import { fillFieldsWithProtocolDetails } from "../../../utils/protocol";

export const AdminViewProtocolPage: React.FC = () => {
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
		<AdminPage title="View protocol">
			<RevisionStoreProvider store={revisionStore}>
				<div className="protocol layout-wrapper">
					<div style={{ maxWidth: "250px", margin: "30px 0" }}>
						<FlexWrapper>
							<ApproveButton status={protocol?.status} protocol_id={protocol?.id} />
							<RejectButton status={protocol?.status} protocol_id={protocol?.id} />
						</FlexWrapper>
					</div>
				</div>
				{protocolSections.slice(0, -1).map((section, idx) => (
					<ProtocolSection
						key={section}
						name={section}
						fields={fieldsWithValues.filter(f => f.section === section)}
						shouldBeOpen={idx === 0}
					/>
				))}
				<RevisionPanel />
			</RevisionStoreProvider>
		</AdminPage>
	);
};
