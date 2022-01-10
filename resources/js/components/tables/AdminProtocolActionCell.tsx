import React from "react";
import { Link } from "react-router-dom";
import { confirmModal } from "../../data/modals/confirm";
import { rejectModal } from "../../data/modals/reject";
import { useModalStore } from "../../hooks/useModalStore";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { approveProtocolQuery, rejectProtocolQuery } from "../../queries/admin";
import { TProtocol, TProtocolStatus } from "../../typings/protocols";

export const AdminProtocolActionCell: React.FC<{ value: string; row: TProtocol }> = ({ row }) => {
	const { t } = useTranslationStore();
	const { setModal } = useModalStore();
	const approveProtocol = async () => {
		const response = await approveProtocolQuery(row.id);
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
				{row.status === TProtocolStatus.Rejected ||
					(row.status === TProtocolStatus.SubmittedForPublication && (
						<button
							className="tertiary small"
							onClick={() =>
								setModal({ ...confirmModal, actionOnConfirm: approveProtocol })
							}
						>
							{t("approve")}
						</button>
					))}
				{row.status === TProtocolStatus.SubmittedForPublication && (
					<button
						className="danger small"
						onClick={() => setModal({ ...rejectModal, data: { protocol_id: row.id } })}
					>
						{t("reject")}
					</button>
				)}
			</div>
		</td>
	);
};
