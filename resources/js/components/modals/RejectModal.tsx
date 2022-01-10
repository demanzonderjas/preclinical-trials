import React from "react";
import { rejectProtocolForm } from "../../data/forms/protocol";
import { useModalStore } from "../../hooks/useModalStore";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { rejectProtocolQuery } from "../../queries/admin";
import { FormBlock } from "../layout/FormBlock";

export const RejectModal: React.FC<{ data: any }> = ({ data }) => {
	const { t } = useTranslationStore();

	const sendRejection = async ({ message }) => {
		await rejectProtocolQuery(data.protocol_id, message);
		// location.reload();
	};

	return (
		<div className="RejectModal">
			<p style={{ textAlign: "center", color: "white" }}>{t("why_reject_protocol")}</p>
			<FormBlock form={rejectProtocolForm} handleSubmit={sendRejection} />
		</div>
	);
};
