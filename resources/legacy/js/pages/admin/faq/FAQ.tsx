import React, { useState, useEffect } from "react";
import { AdminPage } from "../../../components/layout/admin/AdminPage";
import { Filter } from "../../../components/tables/Filter";
import { TableBlock } from "../../../components/tables/TableBlock";
import { FilterStoreProvider } from "../../../contexts/FilterStoreContext";
import { FilterStore } from "../../../stores/FilterStore";
import { adminNewsTable } from "../../../data/tables/news";
import { useTranslationStore } from "../../../hooks/useTranslationStore";
import { Link } from "react-router-dom";
import { TFaqItem } from "../../../typings/faq";
import { getAdminFAQQuery } from "../../../queries/faq";
import { adminFaqItemsTable } from "../../../data/tables/faq";

export const AdminFAQPage: React.FC = () => {
	const [faqItems, setFaqItems] = useState<TFaqItem[]>([]);
	const [filterStore] = useState(new FilterStore());
	const { t } = useTranslationStore();

	useEffect(() => {
		(async () => {
			const response = await getAdminFAQQuery();
			setFaqItems(response.faq_items);
		})();
	}, []);

	return (
		<AdminPage title="FAQ">
			<FilterStoreProvider store={filterStore}>
				<Filter justify="left" options={["title", "content"]} />
				<Link to="/admin/faq/add-item">
					<button type="button" className="tertiary">
						{t("add_faq_item")}
					</button>
				</Link>
				<TableBlock rows={faqItems} table={adminFaqItemsTable}></TableBlock>
			</FilterStoreProvider>
		</AdminPage>
	);
};
