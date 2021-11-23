import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { ContentBlock } from "../components/layout/ContentBlock";
import { Page } from "../components/layout/Page";
import { ProtocolSection } from "../components/protocols/ProtocolSection";
import { protocolSections } from "../data/forms/protocol";
import { getProtocolQuery, saveProtocolQuery, updateProtocolQuery } from "../queries/protocol";
import { TProtocol } from "../typings/protocols";
import { fillFieldsWithProtocolDetails } from "../utils/protocol";

export const ViewProtocolPage: React.FC = () => {
	const { protocol_id }: { protocol_id: string } = useParams();
	const [protocol, setProtocol] = useState(null);

	useEffect(() => {
		if (protocol_id) {
			(async () => {
				const response = await getProtocolQuery(protocol_id);
				const data = response.protocol as TProtocol;
				setProtocol(data);
			})();
		}
	}, [protocol_id]);

	const fieldsWithValues = fillFieldsWithProtocolDetails(protocol);

	return (
		<Page title="View Protocol">
			<div className="ViewProtocol border-top">
				<ContentBlock maxWidth="90%">
					{protocolSections.map((section, idx) => (
						<ProtocolSection
							key={section}
							name={section}
							fields={fieldsWithValues.filter(f => f.section === section)}
							shouldBeOpen={idx === 0}
						/>
					))}
				</ContentBlock>
			</div>
		</Page>
	);
};
