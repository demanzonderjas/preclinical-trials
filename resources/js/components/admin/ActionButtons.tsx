import React from "react";
import { useHistory } from "react-router-dom";
import { confirmModal } from "../../data/modals/confirm";
import { rejectModal } from "../../data/modals/reject";
import { useModalStore } from "../../hooks/useModalStore";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { approveProtocolQuery } from "../../queries/admin";
import { TProtocolStatus } from "../../typings/protocols";

export const RejectButton: React.FC<{ status: TProtocolStatus; protocol_id: number }> = ({
	status,
	protocol_id
}) => {
	const { t } = useTranslationStore();
	const { setModal } = useModalStore();

	if (
		status !== TProtocolStatus.SubmittedForPublication &&
		status !== TProtocolStatus.ResubmittedForPublication
	) {
		return null;
	}

	return (
		<button
			className="danger small"
			onClick={() => setModal({ ...rejectModal, data: { protocol_id } })}
		>
			{t("reject")}
		</button>
	);
};

export const ApproveButton: React.FC<{ status: TProtocolStatus; protocol_id: number }> = ({
	status,
	protocol_id
}) => {
	const { t } = useTranslationStore();
	const { setModal } = useModalStore();
	const { push } = useHistory();

	const approveProtocol = async () => {
		const response = await approveProtocolQuery(protocol_id);
		if (response.success) {
			push("/admin/protocols");
			location.reload();
		}
	};

	if (status === TProtocolStatus.Draft || status === TProtocolStatus.Published) {
		return null;
	}

	return (
		<button
			className="tertiary small"
			onClick={() => setModal({ ...confirmModal, actionOnConfirm: approveProtocol })}
		>
			{t("approve")}
		</button>
	);
};
