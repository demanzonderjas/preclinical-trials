import React, { useState, useEffect } from "react";
import { AdminPage } from "../../components/layout/admin/AdminPage";
import { Filter } from "../../components/tables/Filter";
import { TableBlock } from "../../components/tables/TableBlock";
import { FilterStoreProvider } from "../../contexts/FilterStoreContext";
import { adminProtocolsTable } from "../../data/tables/protocols";
import { getAdminProtocolsQuery } from "../../queries/admin";
import { FilterStore } from "../../stores/FilterStore";
import { TDBProtocol } from "../../typings/protocols";
import { mapProtocolDetailsToObject } from "../../utils/formatting";
import { createProtocolForm } from "../../data/forms/protocol";

export const ProtocolsPage: React.FC = () => {
	const [protocols, setProtocols] = useState<TDBProtocol[]>([]);
	const [filterStore] = useState(new FilterStore());

	useEffect(() => {
		(async () => {
			const response = await getAdminProtocolsQuery();
			setProtocols(response.protocols.map(mapProtocolDetailsToObject));
		})();
	}, []);

	return (
		<AdminPage title="Protocols">
			<FilterStoreProvider store={filterStore}>
				<Filter
					justify="left"
					options={createProtocolForm.fields.filter(f => f.useAsFilter).map(f => f.id)}
				/>
				<TableBlock rows={protocols} table={adminProtocolsTable}></TableBlock>
			</FilterStoreProvider>
		</AdminPage>
	);
};
