import React, { useState, useEffect } from "react";
import { AdminPage } from "../../components/layout/admin/AdminPage";
import { TableBlock } from "../../components/tables/TableBlock";
import { FilterStoreProvider } from "../../contexts/FilterStoreContext";
import { FilterStore } from "../../stores/FilterStore";
import { SingleFilter } from "../../components/tables/SingleFilter";
import { TFormFieldName } from "../../typings/forms";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { getEmbargoExtensions } from "../../queries/embargo";
import { embargoExtensionsTable } from "../../data/tables/embargo";
import { TEmbargoExtension, TEmbargoExtensionStatus } from "../../typings/embargo";

export const EmbargoExtensionsPage: React.FC = () => {
	const [extensions, setExtensions] = useState<TEmbargoExtension[]>([]);
	const [filterStore] = useState(new FilterStore());
	const { t } = useTranslationStore();

	useEffect(() => {
		(async () => {
			const response = await getEmbargoExtensions();
			setExtensions(response.embargo_extensions);
		})();
	}, []);

	return (
		<AdminPage title="Embargo Extensions">
			<FilterStoreProvider store={filterStore}>
				<SingleFilter
					selectionKey={TFormFieldName.PublishStatus}
					options={Object.values(TEmbargoExtensionStatus).map(status => t(status))}
					label={"status"}
					filterPlaceholder="any_status"
					filterIndex={0}
					defaultValue={TEmbargoExtensionStatus.AwaitingApproval}
				/>
				<TableBlock rows={extensions} table={embargoExtensionsTable}></TableBlock>
			</FilterStoreProvider>
		</AdminPage>
	);
};
