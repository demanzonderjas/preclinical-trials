import dayjs from "dayjs";
import React from "react";
import { extendEmbargoAsAdminForm } from "../../data/forms/embargo";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { extendEmbargoAsAdminQuery } from "../../queries/admin";
import { TFormFieldName } from "../../typings/forms";
import { FormBlock } from "../layout/FormBlock";

export const ExtendEmbargoModal: React.FC<{ data: any }> = ({ data }) => {
	const { t } = useTranslationStore();
	const { protocol_id, embargo_end_date } = data;

	const extendEmbargo = async ({ embargo_end_date: newDate }) => {
		const response = await extendEmbargoAsAdminQuery(protocol_id, {
			embargo_end_date: newDate
		});
		if (response.success) {
			location.reload();
		}
		return response;
	};

	const suggestedDate = dayjs(embargo_end_date).add(1, "year").format("YYYY-MM-DD");

	return (
		<div className="ExtendEmbargoModal">
			<p>{t("extend_embargo_description")}</p>
			<p>
				{t("current_embargo_end_date")}: {dayjs(embargo_end_date).format("DD/MM/YYYY")}
			</p>
			<FormBlock
				form={extendEmbargoAsAdminForm}
				handleSubmit={extendEmbargo}
				initialData={[{ key: TFormFieldName.EmbargoEndDate, value: suggestedDate }]}
			/>
		</div>
	);
};
