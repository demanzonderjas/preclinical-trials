import React, { useState, useEffect } from "react";
import { AdminPage } from "../../../components/layout/admin/AdminPage";
import { FormBlock } from "../../../components/layout/FormBlock";
import { createNewsItemQuery, getNewsItemQuery, updateNewsItemQuery } from "../../../queries/news";
import { createNewsItemForm } from "../../../data/forms/news";
import { Link } from "react-router-dom";
import { useTranslationStore } from "../../../hooks/useTranslationStore";
import { useHistory, useParams } from "react-router";
import { TNewsItem } from "../../../typings/news";
import { mapNewsItemToKeyValueArray } from "../../../utils/formatting";

export const EditNewsItemPage: React.FC = () => {
	const { t } = useTranslationStore();
	const [newsItem, setNewsItem] = useState<TNewsItem>(null);
	const { news_item_id }: { news_item_id: string } = useParams();
	const { push } = useHistory();

	useEffect(() => {
		(async () => {
			const response = await getNewsItemQuery(news_item_id);
			setNewsItem(response.news_item);
		})();
	}, [news_item_id]);

	const updateNewsItem = async data => {
		const response = await updateNewsItemQuery(news_item_id, data);
		push("/admin/news");
		return response;
	};

	return (
		<AdminPage title="Edit News Item">
			<Link to="/admin/news">
				<button type="button" className="tertiary" style={{ margin: "20px 0" }}>
					{t("back_to_overview")}
				</button>
			</Link>
			<FormBlock
				withoutMargin={true}
				form={createNewsItemForm}
				initialData={mapNewsItemToKeyValueArray(newsItem)}
				waitForData={true}
				handleSubmit={updateNewsItem}
			></FormBlock>
		</AdminPage>
	);
};
