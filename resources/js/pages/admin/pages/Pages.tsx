import React, { useState, useEffect } from "react";
import { AdminPage } from "../../../components/layout/admin/AdminPage";
import { Filter } from "../../../components/tables/Filter";
import { TableBlock } from "../../../components/tables/TableBlock";
import { FilterStoreProvider } from "../../../contexts/FilterStoreContext";
import { pagesTable } from "../../../data/tables/pages";
import { getPagesQuery } from "../../../queries/pages";
import { FilterStore } from "../../../stores/FilterStore";
import { TPage } from "../../../typings/pages";

export const PagesPage: React.FC = () => {
	const [pages, setPages] = useState<TPage[]>([]);
	const [filterStore] = useState(new FilterStore());

	useEffect(() => {
		(async () => {
			const response = await getPagesQuery();
			setPages(response.pages);
		})();
	}, []);

	return (
		<AdminPage title="Pages">
			<FilterStoreProvider store={filterStore}>
				<Filter justify="left" options={["title", "subtitle", "content_blocks"]} />
				<TableBlock rows={pages} table={pagesTable}></TableBlock>
			</FilterStoreProvider>
		</AdminPage>
	);
};
