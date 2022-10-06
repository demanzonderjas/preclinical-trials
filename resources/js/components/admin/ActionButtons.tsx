import React from "react";
import { useHistory } from "react-router-dom";
import { confirmModal } from "../../data/modals/confirm";
import { rejectEmbargoExtensionModal, rejectProtocolModal } from "../../data/modals/reject";
import { useModalStore } from "../../hooks/useModalStore";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { approveEmbargoExtensionQuery, approveProtocolQuery } from "../../queries/admin";
import { TEmbargoExtensionStatus } from "../../typings/embargo";
import { TProtocolStatus } from "../../typings/protocols";

export const RejectProtocolButton: React.FC<{ status: TProtocolStatus; protocol_id: number }> = ({
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
			onClick={() => setModal({ ...rejectProtocolModal, data: { protocol_id } })}
		>
			{t("reject")}
		</button>
	);
};

export const ApproveProtocolButton: React.FC<{ status: TProtocolStatus; protocol_id: number }> = ({
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

export const ApproveEmbargoExtensionButton: React.FC<{
	status: TEmbargoExtensionStatus;
	embargo_extension_id: number;
}> = ({ status, embargo_extension_id }) => {
	const { t } = useTranslationStore();
	const { setModal } = useModalStore();
	const { push } = useHistory();

	const approveEmbargoExtension = async () => {
		const response = await approveEmbargoExtensionQuery(embargo_extension_id);
		if (response.success) {
			push("/admin/embargo-extensions");
			location.reload();
		}
	};

	if (status === TEmbargoExtensionStatus.Approved) {
		return null;
	}

	return (
		<button
			className="tertiary small"
			onClick={() => setModal({ ...confirmModal, actionOnConfirm: approveEmbargoExtension })}
		>
			{t("approve")}
		</button>
	);
};

export const RejectEmbargoExtensionButton: React.FC<{
	status: TEmbargoExtensionStatus;
	embargo_extension_id: number;
}> = ({ status, embargo_extension_id }) => {
	const { t } = useTranslationStore();
	const { setModal } = useModalStore();

	if (status === TEmbargoExtensionStatus.Approved) {
		return null;
	}

	return (
		<button
			className="danger small"
			onClick={() =>
				setModal({ ...rejectEmbargoExtensionModal, data: { embargo_extension_id } })
			}
		>
			{t("reject")}
		</button>
	);
};
