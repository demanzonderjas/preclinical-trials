import React, { useState, useEffect } from "react";
import { AdminPage } from "../../components/layout/admin/AdminPage";
import { Filter } from "../../components/tables/Filter";
import { TableBlock } from "../../components/tables/TableBlock";
import { FilterStoreProvider } from "../../contexts/FilterStoreContext";
import { adminProtocolsTable } from "../../data/tables/protocols";
import { getAdminProtocolsQuery } from "../../queries/admin";
import { FilterStore } from "../../stores/FilterStore";
import { TDBProtocol, TProtocolStatus } from "../../typings/protocols";
import { mapProtocolDetailsToObject } from "../../utils/formatting";
import { createProtocolForm } from "../../data/forms/protocol";
import { SingleFilter } from "../../components/tables/SingleFilter";
import { TFormFieldName } from "../../typings/forms";
import { useTranslationStore } from "../../hooks/useTranslationStore";

export const ProtocolsPage: React.FC = () => {
	const [protocols, setProtocols] = useState<TDBProtocol[]>([]);
	const [filterStore] = useState(new FilterStore());
	const { t } = useTranslationStore();

	useEffect(() => {
		(async () => {
			const response = await getAdminProtocolsQuery();
			setProtocols(response.protocols.map(mapProtocolDetailsToObject));
		})();
	}, []);

	return (
		<AdminPage title="Protocols">
			<FilterStoreProvider store={filterStore}>
				<SingleFilter
					selectionKey={TFormFieldName.PublishStatus}
					options={Object.values(TProtocolStatus)
						.filter(status => status !== TProtocolStatus.Draft)
						.map(status => t(status))}
					filterPlaceholder="any_status"
					defaultValue="submitted_for_publication"
				/>
				<TableBlock rows={protocols} table={adminProtocolsTable}></TableBlock>
			</FilterStoreProvider>
		</AdminPage>
	);
};
