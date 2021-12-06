import React, { useState, useEffect } from "react";
import { Page } from "../components/layout/Page";
import { getNewsItemQuery } from "../queries/news";
import { TNewsItem } from "../typings/news";
import { useHistory, useParams } from "react-router";
import { NewsItemCard } from "../components/cards/NewsItemCard";
import { useTranslationStore } from "../hooks/useTranslationStore";

export const NewsItemPage: React.FC = () => {
	const [newsItem, setNewsItem] = useState<TNewsItem>(null);
	const { news_item_id }: { news_item_id: string } = useParams();
	const { push } = useHistory();
	const { t } = useTranslationStore();

	useEffect(() => {
		(async () => {
			const response: { news_item: TNewsItem } = await getNewsItemQuery(news_item_id);
			setNewsItem(response.news_item);
		})();
	}, [news_item_id]);

	return (
		<Page title="" subtitle="">
			<div className="NewsItemPage" style={{ backgroundColor: "white", paddingTop: "1px" }}>
				<div
					className="actions layout-wrapper"
					style={{ display: "flex", justifyContent: "right" }}
				>
					<button type="button" className="tertiary small" onClick={() => push("/news")}>
						{t("back_to_overview")}
					</button>
				</div>
				<div className="NewsItem layout-wrapper">
					{newsItem && <NewsItemCard {...newsItem} single={true} />}
				</div>
			</div>
		</Page>
	);
};
