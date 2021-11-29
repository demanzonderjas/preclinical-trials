import React from "react";
import { useParams } from "react-router";
import { useForm } from "../../hooks/useForm";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { deleteProtocolQuery } from "../../queries/protocol";
import { ImportPRIS } from "./ImportPRIS";

export const CreateProtocolPanel: React.FC = () => {
	const { t } = useTranslationStore();
	const { clearFields } = useForm();
	const { protocol_id }: { protocol_id: string } = useParams();

	const deleteProtocol = async () => {
		const response = await deleteProtocolQuery(protocol_id);
		if (response.success) {
			location.href = "/dashboard/manage-protocols";
		}
	};

	return (
		<>
			<p className="intro">
				Register your study by completing the following form. Notice that the fields with an
				asterisk are mandatory, whereas other fields are optional. Once the form is
				submitted it will be checked before publication on this website. Changes made after
				publication on this site will be recorded with an audit trail.
			</p>
			<button type="button" className="secondary small" onClick={() => clearFields()}>
				{t("clear_fields")}
			</button>
			<ImportPRIS />
			{!!protocol_id && (
				<button type="button" className="danger small" onClick={deleteProtocol}>
					{t("delete_protocol")}
				</button>
			)}
		</>
	);
};
