import React from "react";
import { useHistory } from "react-router-dom";
import { rejectProtocolForm } from "../../data/forms/protocol";
import { useModalStore } from "../../hooks/useModalStore";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { rejectProtocolQuery } from "../../queries/admin";
import { FormBlock } from "../layout/FormBlock";

export const RejectProtocolModal: React.FC<{ data: any }> = ({ data }) => {
	const { t } = useTranslationStore();
	const { push } = useHistory();

	const sendRejection = async ({ message }) => {
		await rejectProtocolQuery(data.protocol_id, message);
		push("/admin/protocols");
		location.reload();
	};

	return (
		<div className="RejectModal">
			<p style={{ textAlign: "center", color: "white" }}>{t("why_reject_protocol")}</p>
			<FormBlock form={rejectProtocolForm} handleSubmit={sendRejection} />
		</div>
	);
};
