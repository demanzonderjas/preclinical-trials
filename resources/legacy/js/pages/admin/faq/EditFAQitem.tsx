import React, { useState, useEffect } from "react";
import { AdminPage } from "../../../components/layout/admin/AdminPage";
import { FormBlock } from "../../../components/layout/FormBlock";
import { Link } from "react-router-dom";
import { useTranslationStore } from "../../../hooks/useTranslationStore";
import { useHistory, useParams } from "react-router";
import { mapFaqItemToKeyValueArray, mapNewsItemToKeyValueArray } from "../../../utils/formatting";
import { TFaqItem } from "../../../typings/faq";
import { getFAQItemQuery, updateFAQItemQuery } from "../../../queries/faq";
import { createFAQItemForm } from "../../../data/forms/faq";

export const EditFAQItemPage: React.FC = () => {
	const { t } = useTranslationStore();
	const [faqItem, setFaqItem] = useState<TFaqItem>(null);
	const { faq_item_id }: { faq_item_id: string } = useParams();
	const { push } = useHistory();

	useEffect(() => {
		(async () => {
			const response = await getFAQItemQuery(faq_item_id);
			setFaqItem(response.faq_item);
		})();
	}, [faq_item_id]);

	const updateFaqItem = async data => {
		const response = await updateFAQItemQuery(faq_item_id, data);
		push("/admin/faq");
		return response;
	};

	return (
		<AdminPage title="Edit FAQ Item">
			<Link to="/admin/faq">
				<button type="button" className="tertiary" style={{ margin: "20px 0" }}>
					{t("back_to_overview")}
				</button>
			</Link>
			<FormBlock
				withoutMargin={true}
				form={createFAQItemForm}
				initialData={mapFaqItemToKeyValueArray(faqItem)}
				waitForData={true}
				handleSubmit={updateFaqItem}
			></FormBlock>
		</AdminPage>
	);
};
