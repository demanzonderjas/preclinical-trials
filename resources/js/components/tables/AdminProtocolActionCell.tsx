import React from "react";
import { Link } from "react-router-dom";
import { confirmModal } from "../../data/modals/confirm";
import { useModalStore } from "../../hooks/useModalStore";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { approveProtocolQuery, rejectProtocolQuery } from "../../queries/admin";
import { TProtocol } from "../../typings/protocols";

export const AdminProtocolActionCell: React.FC<{ value: string; row: TProtocol }> = ({ row }) => {
	const { t } = useTranslationStore();
	const { setModal } = useModalStore();
	const approveProtocol = async () => {
		const response = await approveProtocolQuery(row.id);
		if (response.success) {
			location.reload();
		}
	};

	const rejectProtocol = async () => {
		const response = await rejectProtocolQuery(row.id);
		if (response.success) {
			location.reload();
		}
	};

	return (
		<td className="ActionCell">
			<div className="actions">
				<Link to={`/database/view-protocol/${row.id}`} target="_blank">
					<button className="secondary small">{t("view")}</button>
				</Link>
				<button
					className="tertiary small"
					onClick={() => setModal({ ...confirmModal, actionOnConfirm: approveProtocol })}
				>
					{t("approve")}
				</button>
				<button
					className="danger small"
					onClick={() => setModal({ ...confirmModal, actionOnConfirm: rejectProtocol })}
				>
					{t("reject")}
				</button>
			</div>
		</td>
	);
};
