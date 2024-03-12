import React from "react";
import { Link } from "react-router-dom";
import { confirmModal } from "../../data/modals/confirm";
import { linkProtocolsModal } from "../../data/modals/linkProtocols";
import { useModalStore } from "../../hooks/useModalStore";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { deleteProtocolQuery, duplicateProtocolQuery } from "../../queries/protocol";
import { TProtocol, TProtocolStatus } from "../../typings/protocols";

export const ActionCell: React.FC<{ value: string; row: TProtocol }> = ({ row }) => {
	const { t } = useTranslationStore();
	const { setModal } = useModalStore();
	const deleteProtocol = async () => {
		const response = await deleteProtocolQuery(row.id);
		if (response.success) {
			location.reload();
		}
	};

	const duplicateProtocol = async () => {
		const response = await duplicateProtocolQuery(row.id);
		if (response.success) {
			location.reload();
		}
	};

	return (
		<td className="ActionCell">
			<div className="actions">
				<Link to={`/dashboard/edit-protocol/${row.id}`}>
					<button className="small">
						{t(row.status === TProtocolStatus.Published ? "create_amendment" : "edit")}
					</button>
					{row.status === TProtocolStatus.Published && <br />}
				</Link>
				<Link to={`/database/view-protocol/${row.id}`}>
					<button className="tertiary small">{t("view")}</button>
				</Link>
				<button
					className="tertiary small"
					onClick={() =>
						setModal({ ...confirmModal, actionOnConfirm: duplicateProtocol })
					}
				>
					{t("duplicate")}
				</button>
				{row.status === "published" && (
					<button
						className="tertiary small"
						onClick={() =>
							setModal({ ...linkProtocolsModal, data: { protocol_id: row.id } })
						}
					>
						{t("link")}
					</button>
				)}
				<button
					className="danger small"
					onClick={() => setModal({ ...confirmModal, actionOnConfirm: deleteProtocol })}
				>
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
