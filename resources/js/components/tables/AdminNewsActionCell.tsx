import React from "react";
import { Link } from "react-router-dom";
import { confirmModal } from "../../data/modals/confirm";
import { useModalStore } from "../../hooks/useModalStore";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { approveProtocolQuery, rejectProtocolQuery } from "../../queries/admin";
import { deleteNewsItemQuery } from "../../queries/news";
import { TProtocol } from "../../typings/protocols";

export const AdminNewsActionCell: React.FC<{ value: string; row: TProtocol }> = ({ row }) => {
	const { t } = useTranslationStore();
	const { setModal } = useModalStore();

	const deleteNews = async () => {
		const response = await deleteNewsItemQuery(row.id);
		if (response.success) {
			location.reload();
		}
	};

	return (
		<td className="ActionCell">
			<div className="actions">
				<Link to={`/news/view-item/${row.id}`} target="_blank">
					<button className="secondary small">{t("view")}</button>
				</Link>
				<Link to={`/admin/news/edit-item/${row.id}`}>
					<button className="tertiary small">{t("edit")}</button>
				</Link>
				<button
					className="danger small"
					onClick={() => setModal({ ...confirmModal, actionOnConfirm: deleteNews })}
				>
					{t("delete")}
				</button>
			</div>
		</td>
	);
};
