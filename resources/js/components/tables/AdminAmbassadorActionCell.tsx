import React from "react";
import { Link } from "react-router-dom";
import { confirmModal } from "../../data/modals/confirm";
import { useModalStore } from "../../hooks/useModalStore";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { deleteAmbassadorQuery } from "../../queries/ambassadors";
import { TProtocol } from "../../typings/protocols";

export const AdminAmbassadorActionCell: React.FC<{ value: string; row: TProtocol }> = ({ row }) => {
	const { t } = useTranslationStore();
	const { setModal } = useModalStore();

	const deleteAmbassador = async () => {
		const response = await deleteAmbassadorQuery(row.id);
		console.log(row);
		if (response.success) {
			location.reload();
		}
	};

	return (
		<td className="ActionCell">
			<div className="actions">
				<Link to={"/about-pct/ambassadors"} target="_blank">
					<button className="secondary xs">{t("view")}</button>
				</Link>
				<button
					className="danger xs"
					onClick={() => setModal({ ...confirmModal, actionOnConfirm: deleteAmbassador })}
				>
					{t("delete")}
				</button>
			</div>
		</td>
	);
};
