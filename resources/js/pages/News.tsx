import React, { useState, useEffect } from "react";
import { Page } from "../components/layout/Page";
import { getNewsItemsQuery } from "../queries/news";
import { TNewsItem } from "../typings/news";
import { NewsCardsBlock } from "../components/cards/CardsBlock";
import { FilterStore } from "../stores/FilterStore";
import { FilterStoreProvider } from "../contexts/FilterStoreContext";
import { Filter } from "../components/tables/Filter";
import day from "dayjs";
import { usePage } from "../hooks/usePage";

export const NewsPage: React.FC = () => {
	const [newsItems, setNewsItems] = useState<TNewsItem[]>([]);
	const [filterStore] = useState<FilterStore>(new FilterStore());
	const { page } = usePage();

	useEffect(() => {
		(async () => {
			const news: { news_items: TNewsItem[] } = await getNewsItemsQuery();
			setNewsItems(news.news_items);
		})();
	}, []);

	const dateOptionsToInclude: string[] = newsItems.reduce((base, next) => {
		const publishedDate = day(next.updated_at)
			.get("year")
			.toString();
		if (!base.includes(publishedDate)) {
			return [...base, publishedDate];
		}
		return base;
	}, []);

	return (
		<Page title={page.title} subtitle={page.subtitle}>
			<div className="NewsPage border-top" style={{ backgroundColor: "white" }}>
				<FilterStoreProvider store={filterStore}>
					<Filter options={dateOptionsToInclude} filterPlaceholder="any_year" />
					<NewsCardsBlock newsItems={newsItems} />
				</FilterStoreProvider>
			</div>
		</Page>
	);
};
