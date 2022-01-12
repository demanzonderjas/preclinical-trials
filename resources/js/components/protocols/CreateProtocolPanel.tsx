import { observer } from "mobx-react-lite";
import React from "react";
import { useHistory, useParams } from "react-router";
import { confirmModal } from "../../data/modals/confirm";
import { useForm } from "../../hooks/useForm";
import { useModalStore } from "../../hooks/useModalStore";
import { useProtocol } from "../../hooks/useProtocol";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import {
	deleteProtocolQuery,
	saveProtocolQuery,
	updateProtocolQuery
} from "../../queries/protocol";
import { TProtocol, TProtocolStatus } from "../../typings/protocols";
import { ImportPRIS } from "./ImportPRIS";

export const CreateProtocolPanel: React.FC<{ hideIntro?: boolean }> = observer(({ hideIntro }) => {
	const { t } = useTranslationStore();
	const { activeSection, createKeyValuePairs, getSectionByIndex, clearFields } = useForm();
	const { protocol_id }: { protocol_id: string } = useParams();
	const { setModal } = useModalStore();
	const { status } = useProtocol();
	const { push } = useHistory();

	const saveAsDraft = async () => {
		const data = createKeyValuePairs() as TProtocol;
		if (protocol_id) {
			updateProtocolQuery(protocol_id, data);
		} else {
			const response = await saveProtocolQuery(data);
			if (response.protocol_id) {
				const protocolId = response.protocol_id;
				const nextSectionIndex = getSectionByIndex(activeSection);
				location.href = `/dashboard/edit-protocol/${protocolId}#${nextSectionIndex}`;
			}
		}
	};

	const deleteProtocol = async () => {
		const response = await deleteProtocolQuery(protocol_id);
		if (response.success) {
			location.href = "/dashboard/manage-protocols";
		}
	};

	return (
		<>
			{!hideIntro && (
				<p className="intro">
					Register your study by completing the following form. Notice that the fields
					with an asterisk are mandatory, whereas other fields are optional. Once the form
					is submitted it will be checked before publication on this website. Changes made
					after publication on this site will be recorded with an audit trail.
				</p>
			)}
			<div
				className="flex-wrapper"
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					margin: "16px 0"
				}}
			>
				{status === TProtocolStatus.Draft && (
					<button className="secondary small" type="button" onClick={saveAsDraft}>
						{t("save_changes")}
					</button>
				)}
				{protocol_id && (
					<button
						type="button"
						className="primary small"
						onClick={() => push(`/database/view-protocol/${protocol_id}`)}
					>
						{t("view_protocol")}
					</button>
				)}
				{status === TProtocolStatus.Draft && (
					<>
						<ImportPRIS />
						<button
							type="button"
							className="danger small"
							onClick={() =>
								setModal({ ...confirmModal, actionOnConfirm: clearFields })
							}
						>
							{t("clear_fields")}
						</button>
					</>
				)}
				{!!protocol_id && (
					<button
						type="button"
						className="danger small"
						onClick={() =>
							setModal({ ...confirmModal, actionOnConfirm: deleteProtocol })
						}
					>
						{t("delete_protocol")}
					</button>
				)}
			</div>
		</>
	);
});
