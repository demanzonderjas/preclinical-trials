import React, { useEffect, useState } from "react";
import { Page } from "../components/layout/Page";
import { Filter } from "../components/tables/Filter";
import { TableBlock } from "../components/tables/TableBlock";
import { FilterStoreProvider } from "../contexts/FilterStoreContext";
import { createProtocolForm } from "../data/forms/protocol";
import { searchProtocolsTable } from "../data/tables/protocols";
import { getViewableProtocolsQuery } from "../queries/protocol";
import { FilterStore } from "../stores/FilterStore";
import { mapProtocolDetailsToObject } from "../utils/formatting";

export const SearchDatabasePage: React.FC = () => {
	const [protocols, setProtocols] = useState([]);
	const [filterStore] = useState(new FilterStore());

	useEffect(() => {
		(async () => {
			const response = await getViewableProtocolsQuery();
			setProtocols(response.protocols.map(mapProtocolDetailsToObject));
		})();
	}, []);

	return (
		<FilterStoreProvider store={filterStore}>
			<Page title="Search protocols">
				<div className="SearchDatabase border-top" style={{ background: "white" }}>
					<Filter
						options={createProtocolForm.fields
							.filter(f => f.useAsFilter)
							.map(f => f.id)}
					/>
					<TableBlock table={searchProtocolsTable} rows={protocols} />
				</div>
			</Page>
		</FilterStoreProvider>
	);
};
