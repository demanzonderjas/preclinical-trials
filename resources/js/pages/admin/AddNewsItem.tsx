import React from "react";
import { AdminPage } from "../../components/layout/admin/AdminPage";
import { FormBlock } from "../../components/layout/FormBlock";
import { createNewsItemQuery } from "../../queries/news";
import { createNewsItemForm } from "../../data/forms/news";
import { Link } from "react-router-dom";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { useHistory } from "react-router";

export const AddNewsItemPage: React.FC = () => {
	const { t } = useTranslationStore();
	const { push } = useHistory();

	const addNewsItem = async data => {
		const response = await createNewsItemQuery(data);
		push("/admin/news");
		return response;
	};

	return (
		<AdminPage title="Add News Item">
			<Link to="/admin/news">
				<button type="button" className="tertiary" style={{ margin: "20px 0" }}>
					{t("back_to_overview")}
				</button>
			</Link>
			<FormBlock
				withoutMargin={true}
				form={createNewsItemForm}
				handleSubmit={addNewsItem}
			></FormBlock>
		</AdminPage>
	);
};
