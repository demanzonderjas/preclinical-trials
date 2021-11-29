import React from "react";
import { Link } from "react-router-dom";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { deleteProtocolQuery } from "../../queries/protocol";
import { TProtocol } from "../../typings/protocols";

export const ActionCell: React.FC<{ value: string; row: TProtocol }> = ({ row }) => {
	const { t } = useTranslationStore();
	const deleteProtocol = async () => {
		const response = await deleteProtocolQuery(row.id);
		if (response.success) {
			location.reload();
		}
	};
	return (
		<td className="ActionCell">
			<div className="actions">
				<Link to={`/dashboard/edit-protocol/${row.id}`}>
					<button className="small">{t("edit")}</button>
				</Link>
				<Link to={`/database/view-protocol/${row.id}`}>
					<button className="tertiary small">{t("view")}</button>
				</Link>
				<button className="danger small" onClick={deleteProtocol}>
					{t("delete")}
				</button>
			</div>
		</td>
	);
};

export const EditCell: React.FC<{ value: string; row: TProtocol }> = ({ row }) => {
	return (
		<td className="ActionCell">
			<Link to={`/dashboard/edit-protocol/${row.id}`}>
				<button>Edit</button>
			</Link>
		</td>
	);
};

export const ViewCell: React.FC<{ value: string; row: TProtocol }> = ({ row }) => {
	return (
		<td className="ActionCell">
			<Link to={`/database/view-protocol/${row.id}`}>
				<button className="tertiary">View</button>
			</Link>
		</td>
	);
};
