import React from "react";
import { Link } from "react-router-dom";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { TProtocol } from "../../typings/protocols";
import { ApproveProtocolButton, RejectProtocolButton } from "../admin/ActionButtons";

export const AdminProtocolActionCell: React.FC<{ value: string; row: TProtocol }> = ({ row }) => {
	const { t } = useTranslationStore();

	return (
		<td className="ActionCell">
			<div className="actions">
				<Link to={`/admin/protocols/${row.id}`} target="_blank">
					<button className="secondary small">{t("view")}</button>
				</Link>
				<ApproveProtocolButton status={row.status} protocol_id={row.id} />
				<RejectProtocolButton status={row.status} protocol_id={row.id} />
			</div>
		</td>
	);
};
