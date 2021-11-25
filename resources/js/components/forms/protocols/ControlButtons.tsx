import { observer } from "mobx-react-lite";
import React from "react";
import { useHistory, useParams } from "react-router";
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
		isFirstSection,
		form,
		goToNextSection,
		goToPrevSection,
		createKeyValuePairs,
		validate,
		sections,
		getSectionByIndex,
		activeSection
	} = useForm();
	const { protocol_id }: { protocol_id: string } = useParams();
	const { t } = useTranslationStore();

	const saveAsDraft = async (e: any, goBack?: boolean) => {
		e.preventDefault();
		const data = createKeyValuePairs() as TProtocol;
		if (protocol_id) {
			updateProtocolQuery(protocol_id, data);
			if (goBack) {
				goToPrevSection(e);
			} else {
				goToNextSection(e);
			}
		} else {
			const response = await saveProtocolQuery(data);
			const protocolId = response.protocol_id;
			const nextSectionIndex = goBack
				? getSectionByIndex(activeSection) + 1
				: getSectionByIndex(activeSection) - 1;
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
			{!isFirstSection && !!sections && (
				<button onClick={e => saveAsDraft(e, true)}>{t("go_back")}</button>
			)}
			{!isLastSection && <button onClick={saveAsDraft}>{t("go_to_next_section")}</button>}
			{!!isLastSection && <button type="submit">{t(form.submitText)}</button>}
			{!!isLastSection && !!sections && (
				<button onClick={submitForPublication}>{t("submit_for_publication")}</button>
			)}
		</div>
	);
});
