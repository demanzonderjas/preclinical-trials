import React from "react";
import { Link } from "react-router-dom";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { TEmbargoExtension } from "../../typings/embargo";
import { ApproveEmbargoExtensionButton } from "../admin/ActionButtons";

export const AdminEmbargoExtensionActionCell: React.FC<{
	value: string;
	row: TEmbargoExtension;
}> = ({ row }) => {
	const { t } = useTranslationStore();

	return (
		<td className="ActionCell">
			<div className="actions">
				<Link to={`/admin/protocols/${row.protocol.id}`} target="_blank">
					<button className="secondary small">{t("view")}</button>
				</Link>
				<ApproveEmbargoExtensionButton status={row.status} embargo_extension_id={row.id} />
			</div>
		</td>
	);
};
