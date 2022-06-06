import React, { useState, useEffect } from "react";
import { AdminPage } from "../../../components/layout/admin/AdminPage";
import { Filter } from "../../../components/tables/Filter";
import { TableBlock } from "../../../components/tables/TableBlock";
import { FilterStoreProvider } from "../../../contexts/FilterStoreContext";
import { FilterStore } from "../../../stores/FilterStore";
import { useTranslationStore } from "../../../hooks/useTranslationStore";
import { Link } from "react-router-dom";
import { TAmbassador } from "../../../typings/aboutUs";
import { getAmbassadorsQuery } from "../../../queries/ambassadors";
import { ambassadorsTable } from "../../../data/tables/ambassadors";

export const AdminAmbassadorsPage: React.FC = () => {
	const [ambassadors, setAmbassadors] = useState<TAmbassador[]>([]);
	const [filterStore] = useState(new FilterStore());
	const { t } = useTranslationStore();

	useEffect(() => {
		(async () => {
			const response = await getAmbassadorsQuery();
			setAmbassadors(response.ambassadors);
		})();
	}, []);

	return (
		<AdminPage title="Ambassadors">
			<FilterStoreProvider store={filterStore}>
				<Filter justify="left" options={["name", "description"]} />
				<Link to="/admin/ambassadors/add-ambassador">
					<button type="button" className="tertiary">
						{t("add_ambassador")}
					</button>
				</Link>
				<TableBlock rows={ambassadors} table={ambassadorsTable}></TableBlock>
			</FilterStoreProvider>
		</AdminPage>
	);
};
