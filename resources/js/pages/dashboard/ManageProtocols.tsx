import React, { useEffect, useState } from "react";
import { ContentBlock } from "../../components/layout/ContentBlock";
import { Page } from "../../components/layout/Page";
import { TableBlock } from "../../components/tables/TableBlock";
import { manageProtocolsTable } from "../../data/tables/protocols";
import { getMyProtocolsQuery } from "../../queries/protocol";
import { mapProtocolDetailsToObject } from "../../utils/formatting";

export const ManageProtocolsPage: React.FC = () => {
	const [protocols, setProtocols] = useState([]);

	useEffect(() => {
		(async () => {
			const response = await getMyProtocolsQuery();
			setProtocols(response.protocols.map(mapProtocolDetailsToObject));
		})();
	}, []);

	console.log(protocols);

	return (
		<Page title="Manage protocols">
			<div className="ManageProtocolsPage">
				<ContentBlock maxWidth="80%">
					<p>
						Listed below are all records you have previously created. You can continue
						to edit any record that has not been submitted for publication and you can
						view but not edit any record that has been submitted. You can create an
						updated version of any record that is published.
					</p>
					<TableBlock table={manageProtocolsTable} rows={protocols} />
				</ContentBlock>
			</div>
		</Page>
	);
};
