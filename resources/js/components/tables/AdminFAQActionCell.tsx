import React from "react";
import { Link } from "react-router-dom";
import { confirmModal } from "../../data/modals/confirm";
import { useModalStore } from "../../hooks/useModalStore";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { deleteFAQItemQuery } from "../../queries/faq";
import { TProtocol } from "../../typings/protocols";

export const AdminFAQActionCell: React.FC<{ value: string; row: TProtocol }> = ({ row }) => {
	const { t } = useTranslationStore();
	const { setModal } = useModalStore();

	const deleteFAQItem = async () => {
		const response = await deleteFAQItemQuery(row.id);
		if (response.success) {
			location.reload();
		}
	};

	return (
		<td className="ActionCell">
			<div className="actions">
				<Link to={"/help"} target="_blank">
					<button className="secondary xs">{t("view")}</button>
				</Link>
				<Link to={`/admin/faq/edit-item/${row.id}`}>
					<button className="tertiary xs">{t("edit")}</button>
				</Link>
				<button
					className="danger xs"
					onClick={() => setModal({ ...confirmModal, actionOnConfirm: deleteFAQItem })}
				>
					{t("delete")}
				</button>
			</div>
		</td>
	);
};
