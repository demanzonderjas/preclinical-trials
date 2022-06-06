import React from "react";
import { AdminPage } from "../../../components/layout/admin/AdminPage";
import { FormBlock } from "../../../components/layout/FormBlock";
import { Link } from "react-router-dom";
import { useTranslationStore } from "../../../hooks/useTranslationStore";
import { useHistory } from "react-router";
import { createFAQItemQuery } from "../../../queries/faq";
import { addAmbassadorForm } from "../../../data/forms/ambassadors";
import { createAmbassadorQuery } from "../../../queries/ambassadors";

export const AddAmbassadorPage: React.FC = () => {
	const { t } = useTranslationStore();
	const { push } = useHistory();

	const addAmbassador = async data => {
		const response = await createAmbassadorQuery(data);
		push("/admin/ambassadors");
		return response;
	};

	return (
		<AdminPage title="Add Ambassador">
			<Link to="/admin/ambassadors">
				<button type="button" className="tertiary" style={{ margin: "20px 0" }}>
					{t("back_to_overview")}
				</button>
			</Link>
			<FormBlock
				withoutMargin={true}
				form={addAmbassadorForm}
				width={100}
				handleSubmit={addAmbassador}
			></FormBlock>
		</AdminPage>
	);
};
