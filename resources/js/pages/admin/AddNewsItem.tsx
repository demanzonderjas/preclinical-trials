import React from "react";
import { AdminPage } from "../../components/layout/admin/AdminPage";
import { FormBlock } from "../../components/layout/FormBlock";
import { createNewsItemQuery } from "../../queries/news";
import { createNewsItemForm } from "../../data/forms/news";
import { Link } from "react-router-dom";
import { useTranslationStore } from "../../hooks/useTranslationStore";

export const AddNewsItemPage: React.FC = () => {
	const { t } = useTranslationStore();
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
				handleSubmit={createNewsItemQuery}
			></FormBlock>
		</AdminPage>
	);
};
