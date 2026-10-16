import React, { useState, useEffect } from "react";
import { AdminPage } from "../../../components/layout/admin/AdminPage";
import { Filter } from "../../../components/tables/Filter";
import { TableBlock } from "../../../components/tables/TableBlock";
import { FilterStoreProvider } from "../../../contexts/FilterStoreContext";
import { FilterStore } from "../../../stores/FilterStore";
import { TNewsItem } from "../../../typings/news";
import { adminNewsTable } from "../../../data/tables/news";
import { getAdminNewsQuery } from "../../../queries/news";
import { useTranslationStore } from "../../../hooks/useTranslationStore";
import { Link } from "react-router-dom";

export const NewsPage: React.FC = () => {
	const [news, setNews] = useState<TNewsItem[]>([]);
	const [filterStore] = useState(new FilterStore());
	const { t } = useTranslationStore();

	useEffect(() => {
		(async () => {
			const response = await getAdminNewsQuery();
			setNews(response.news_items);
		})();
	}, []);

	return (
		<AdminPage title="News">
			<FilterStoreProvider store={filterStore}>
				<Filter justify="left" options={["title", "summary", "content"]} />
				<Link to="/admin/news/add-item">
					<button type="button" className="tertiary">
						{t("add_news_item")}
					</button>
				</Link>
				<TableBlock rows={news} table={adminNewsTable}></TableBlock>
			</FilterStoreProvider>
		</AdminPage>
	);
};
