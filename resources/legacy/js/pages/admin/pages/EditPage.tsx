import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router";
import { Link } from "react-router-dom";
import { AdminPage } from "../../../components/layout/admin/AdminPage";
import { FormBlock } from "../../../components/layout/FormBlock";
import { createPageForm } from "../../../data/forms/pages";

import { useTranslationStore } from "../../../hooks/useTranslationStore";
import { getPageQuery, updatePageQuery } from "../../../queries/pages";
import { TPage } from "../../../typings/pages";
import { mapModelToKeyValueArray } from "../../../utils/formatting";

export const EditPagePage: React.FC = () => {
	const { t } = useTranslationStore();
	const [page, setPage] = useState<TPage>(null);
	const { page_id }: { page_id: string } = useParams();
	const { push } = useHistory();

	useEffect(() => {
		(async () => {
			const response = await getPageQuery(page_id);
			setPage(response.page);
		})();
	}, [page_id]);

	const updatePage = async data => {
		const response = await updatePageQuery(page_id, data);
		push("/admin/pages");
		return response;
	};

	return (
		<AdminPage title="Edit Page">
			<Link to="/admin/pages">
				<button type="button" className="tertiary" style={{ margin: "20px 0" }}>
					{t("back_to_overview")}
				</button>
			</Link>
			<FormBlock
				withoutMargin={true}
				form={createPageForm}
				initialData={mapModelToKeyValueArray(page, createPageForm)}
				waitForData={true}
				handleSubmit={updatePage}
			></FormBlock>
		</AdminPage>
	);
};
