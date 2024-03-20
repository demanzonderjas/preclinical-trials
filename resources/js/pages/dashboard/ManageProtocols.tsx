import React, { useEffect, useState } from "react";
import { ContentBlock } from "../../components/layout/ContentBlock";
import { Page } from "../../components/layout/Page";
import { Filter } from "../../components/tables/Filter";
import { TableBlock } from "../../components/tables/TableBlock";
import { FilterStoreProvider } from "../../contexts/FilterStoreContext";
import { createProtocolForm } from "../../data/forms/protocol";
import { manageProtocolsTable } from "../../data/tables/protocols";
import { getMyProtocolsQuery } from "../../queries/protocol";
import { FilterStore } from "../../stores/FilterStore";
import { mapProtocolDetailsToObject } from "../../utils/formatting";

export const ManageProtocolsPage: React.FC = () => {
	const [protocols, setProtocols] = useState([]);
	const [filterStore] = useState(new FilterStore());

	useEffect(() => {
		(async () => {
			const response = await getMyProtocolsQuery();
			setProtocols(response.protocols.map(mapProtocolDetailsToObject));
		})();
	}, []);

	return (
		<FilterStoreProvider store={filterStore}>
			<Page title="Manage protocols" needsVerification={true}>
				<div className="ManageProtocolsPage">
					<ContentBlock maxWidth="80%">
						<p>
							Listed below are all records you have previously created. You can
							continue to edit any record that has not been submitted for publication
							and you can view but not edit any record that has been submitted. You
							can create an updated version of any record that is published.
						</p>
						<p>
							You may also duplicate your record to gain time when writing several
							protocols with similar methodologies. Once they are published, you may
							also link them if they are part of the same project using the "link"
							button. This link will be mentioned at the bottom of the published
							protocols
						</p>
						<Filter
							justify="left"
							options={createProtocolForm.fields
								.filter(f => f.useAsFilter)
								.map(f => f.filterLabel || f.id)}
						/>
						<TableBlock table={manageProtocolsTable} rows={protocols} />
					</ContentBlock>
				</div>
			</Page>
		</FilterStoreProvider>
	);
};
