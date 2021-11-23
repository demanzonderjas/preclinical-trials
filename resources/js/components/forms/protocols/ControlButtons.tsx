import { observer } from "mobx-react-lite";
import React from "react";
import { useParams } from "react-router";
import { useForm } from "../../../hooks/useForm";
import { useTranslationStore } from "../../../hooks/useTranslationStore";
import {
	saveProtocolQuery,
	submitProtocolForPulicationQuery,
	updateProtocolQuery
} from "../../../queries/protocol";
import { TProtocol } from "../../../typings/protocols";

export const ControlButtons: React.FC = observer(() => {
	const {
		isLastSection,
		form,
		goToNextSection,
		createKeyValuePairs,
		validate,
		sections,
		getSectionByIndex,
		activeSection
	} = useForm();
	const { protocol_id }: { protocol_id: string } = useParams();
	const { t } = useTranslationStore();

	const saveAsDraft = async e => {
		e.preventDefault();
		const data = createKeyValuePairs() as TProtocol;
		if (protocol_id) {
			updateProtocolQuery(protocol_id, data);
			goToNextSection(e);
		} else {
			const response = await saveProtocolQuery(data);
			const protocolId = response.protocol_id;
			const nextSectionIndex = getSectionByIndex(activeSection) + 1;
			location.href = `/dashboard/edit-protocol/${protocolId}#${nextSectionIndex}`;
		}
	};

	const submitForPublication = async e => {
		e.preventDefault();
		const data = createKeyValuePairs() as TProtocol;
		await updateProtocolQuery(protocol_id, data);
		if (validate()) {
			await submitProtocolForPulicationQuery(protocol_id);
		}
	};

	return (
		<div className="ControlButtons">
			{!isLastSection && <button onClick={saveAsDraft}>{t("go_to_next_section")}</button>}
			{!!isLastSection && <button type="submit">{t(form.submitText)}</button>}
			{!!isLastSection && !!sections && (
				<button onClick={submitForPublication}>{t("submit_for_publication")}</button>
			)}
		</div>
	);
});
