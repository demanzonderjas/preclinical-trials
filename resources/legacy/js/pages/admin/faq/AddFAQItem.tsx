import React from "react";
import { AdminPage } from "../../../components/layout/admin/AdminPage";
import { FormBlock } from "../../../components/layout/FormBlock";
import { createNewsItemForm } from "../../../data/forms/news";
import { Link } from "react-router-dom";
import { useTranslationStore } from "../../../hooks/useTranslationStore";
import { useHistory } from "react-router";
import { createFAQItemQuery } from "../../../queries/faq";
import { createFAQItemForm } from "../../../data/forms/faq";

export const AddFAQItemPage: React.FC = () => {
	const { t } = useTranslationStore();
	const { push } = useHistory();

	const addFaqItem = async data => {
		const response = await createFAQItemQuery(data);
		push("/admin/faq");
		return response;
	};

	return (
		<AdminPage title="Add FAQ Item">
			<Link to="/admin/faq">
				<button type="button" className="tertiary" style={{ margin: "20px 0" }}>
					{t("back_to_overview")}
				</button>
			</Link>
			<FormBlock
				withoutMargin={true}
				form={createFAQItemForm}
				width={100}
				handleSubmit={addFaqItem}
			></FormBlock>
		</AdminPage>
	);
};
