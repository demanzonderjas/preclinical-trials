import React, { useEffect, useState } from "react";
import { FormBlock } from "../../components/layout/FormBlock";
import { Page } from "../../components/layout/Page";
import { CreateProtocolPanel } from "../../components/protocols/CreateProtocolPanel";
import { ProtocolStatus } from "../../components/protocols/ProtocolStatus";
import { ProtocolStoreProvider } from "../../contexts/ProtocolContext";
import { createProtocolForm, protocolSections } from "../../data/forms/protocol";
import { saveProtocolQuery } from "../../queries/protocol";
import { ProtocolStore } from "../../stores/ProtocolStore";
import { useUser } from "../../hooks/useUser";
import { observer } from "mobx-react-lite";

export const AddProtocolPage: React.FC = observer(() => {
	const [protocolStore] = useState(new ProtocolStore());
	const [initialData, setInitialData] = useState(null);
	const { user } = useUser();

	useEffect(() => {
		if (user) {
			const data = {
				contact_name: `${user.first_name} ${user.last_name}`,
				contact_email: user.email,
				contact_role: user.role || "",
				study_centre: [
					{
						name: user.institution || "",
						city: user.city || "",
						country: user.country || ""
					}
				]
			};
			const mapped = Object.keys(data).map(key => ({
				key,
				value: data[key]
			}));

			setInitialData(mapped);
		}
	}, [user]);

	return (
		<Page title="Add Protocol" needsVerification={true}>
			<div className="AddProtocol border-top">
				<ProtocolStoreProvider store={protocolStore}>
					<ProtocolStatus />
					<FormBlock
						form={createProtocolForm}
						handleSubmit={saveProtocolQuery}
						waitForData={true}
						initialData={initialData}
						icon="add.png"
						sections={protocolSections}
					>
						<CreateProtocolPanel />
					</FormBlock>
				</ProtocolStoreProvider>
			</div>
		</Page>
	);
});
