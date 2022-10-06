import React from "react";
import { useHistory } from "react-router-dom";
import { rejectEmbargoExtensionForm } from "../../data/forms/embargo";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { rejectEmbargoExtensionQuery } from "../../queries/admin";
import { FormBlock } from "../layout/FormBlock";

export const RejectEmbargoExtensionModal: React.FC<{ data: any }> = ({ data }) => {
	const { t } = useTranslationStore();
	const { push } = useHistory();

	const sendRejection = async ({ message }) => {
		await rejectEmbargoExtensionQuery(data.embargo_extension_id, message);
		push("/admin/embargo-extensions");
		location.reload();
	};

	return (
		<div className="RejectModal">
			<p style={{ textAlign: "center", color: "white" }}>
				{t("why_reject_embargo_extension")}
			</p>
			<FormBlock form={rejectEmbargoExtensionForm} handleSubmit={sendRejection} />
		</div>
	);
};
