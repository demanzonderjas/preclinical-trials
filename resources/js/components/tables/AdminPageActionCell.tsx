import React from "react";
import { Link } from "react-router-dom";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { TPage } from "../../typings/pages";

export const AdminPageActionCell: React.FC<{ value: string; row: TPage }> = ({ row }) => {
	const { t } = useTranslationStore();

	return (
		<td className="ActionCell" style={{ width: "175px" }}>
			<div className="actions" style={{ display: "flex", justifyContent: "space-between" }}>
				<Link to={`${row.slug}`} target="_blank">
					<button className="secondary xs">{t("view")}</button>
				</Link>
				<Link to={`/admin/pages/edit-item/${row.id}`}>
					<button className="tertiary xs">{t("edit")}</button>
				</Link>
			</div>
		</td>
	);
};
