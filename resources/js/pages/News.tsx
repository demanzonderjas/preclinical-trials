import React, { useState, useEffect } from "react";
import { Page } from "../components/layout/Page";
import { getNewsItemsQuery } from "../queries/news";
import { TNewsItem } from "../typings/news";
import { NewsCardsBlock } from "../components/cards/CardsBlock";
import { FilterStore } from "../stores/FilterStore";
import { FilterStoreProvider } from "../contexts/FilterStoreContext";
import { Filter } from "../components/tables/Filter";

export const NewsPage: React.FC = () => {
	const [newsItems, setNewsItems] = useState<TNewsItem[]>([]);
	const [filterStore] = useState<FilterStore>(new FilterStore());

	useEffect(() => {
		(async () => {
			const news: { news_items: TNewsItem[] } = await getNewsItemsQuery();
			setNewsItems(news.news_items);
		})();
	}, []);

	return (
		<Page
			title="News"
			subtitle="Updates including congresses and workshops where preclinicaltrials.eu is involved"
		>
			<div className="NewsPage" style={{ backgroundColor: "white" }}>
				<FilterStoreProvider store={filterStore}>
					<Filter options={["2021", "2020"]} />
					<NewsCardsBlock newsItems={newsItems} />
				</FilterStoreProvider>
			</div>
		</Page>
	);
};
