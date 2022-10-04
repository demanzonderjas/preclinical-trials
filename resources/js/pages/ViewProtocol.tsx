import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { LoginForm } from "../components/account/LoginForm";
import { ContentBlock } from "../components/layout/ContentBlock";
import { Page } from "../components/layout/Page";
import { ProtocolSection } from "../components/protocols/ProtocolSection";
import { RevisionPanel } from "../components/protocols/RevisionPanel";
import { RevisionStoreProvider } from "../contexts/RevisionStoreContext";
import { pctIdField } from "../data/forms/fields/protocol/id";
import { protocolSections } from "../data/forms/protocol";
import { getProtocolQuery } from "../queries/protocol";
import { RevisionStore } from "../stores/RevisionStore";
import { TFormFieldName } from "../typings/forms";
import { TDBProtocol } from "../typings/protocols";
import { fillFieldsWithProtocolDetails } from "../utils/protocol";

export const ViewProtocolPage: React.FC = () => {
	const { protocol_id }: { protocol_id: string } = useParams();
	const [protocol, setProtocol] = useState<TDBProtocol>(null);
	const [requiresAccountError, setRequiresAccountError] = useState<boolean>(false);
	const [revisionStore, setRevisionStore] = useState<RevisionStore>(null);

	useEffect(() => {
		if (protocol_id) {
			(async () => {
				const response = await getProtocolQuery(protocol_id);
				if (response.success === false && response.message === "requires_account") {
					setRequiresAccountError(true);
					return;
				}
				const data = response.protocol as TDBProtocol;
				setProtocol(data);
				setRevisionStore(new RevisionStore(data));
			})();
		}
	}, [protocol_id]);

	const fieldsWithValues = [
		{ ...pctIdField, value: protocol?.pct_id },
		...fillFieldsWithProtocolDetails(protocol).filter(
			f => f.id != TFormFieldName.ContactEmail && f.id != TFormFieldName.ContactRole
		)
	];

	return (
		<RevisionStoreProvider store={revisionStore}>
			<Page title="View Protocol">
				<div className="ViewProtocol border-top">
					<ContentBlock maxWidth="90%">
						<div className="protocol layout-wrapper">
							{!requiresAccountError && (
								<>
									{protocolSections.map((section, idx) => (
										<ProtocolSection
											key={section}
											name={section}
											fields={fieldsWithValues.filter(
												f => f.section === section
											)}
											shouldBeOpen={idx === 0}
										/>
									))}
									<RevisionPanel />
								</>
							)}
							{requiresAccountError && (
								<div style={{ padding: "20px", backgroundColor: "#f0f0f0" }}>
									<p style={{ textAlign: "center" }}>
										Viewing a protocol requires you to be logged in first.
									</p>
									<LoginForm />
								</div>
							)}
						</div>
					</ContentBlock>
				</div>
			</Page>
		</RevisionStoreProvider>
	);
};
