import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import { useForm } from "../../../hooks/useForm";
import { useProtocol } from "../../../hooks/useProtocol";
import { useTranslationStore } from "../../../hooks/useTranslationStore";
import {
	getProtocolStatusQuery,
	saveProtocolQuery,
	submitProtocolForPublicationQuery,
	updateProtocolQuery
} from "../../../queries/protocol";
import { TProtocol, TProtocolStatus } from "../../../typings/protocols";

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
	const { status } = useProtocol();
	console.log(status);

	const saveAsDraft = async (goBack?: boolean) => {
		if (status !== TProtocolStatus.Draft) {
			if (goBack) {
				goToPrevSection();
			} else {
				goToNextSection();
			}
			return;
		}
		const data = createKeyValuePairs() as TProtocol;
		if (protocol_id) {
			updateProtocolQuery(protocol_id, data);
			if (goBack) {
				goToPrevSection();
			} else {
				goToNextSection();
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

	const resubmitForPublication = async () => {
		const data = createKeyValuePairs() as TProtocol;
		await updateProtocolQuery(protocol_id, data);
		submitForPublication();
	};

	const submitForPublication = async () => {
		const data = createKeyValuePairs() as TProtocol;
		if (validate()) {
			if (protocol_id) {
				await updateProtocolQuery(protocol_id, data);
				await submitProtocolForPublicationQuery(protocol_id);
				location.href = `/database/view-protocol/${protocol_id}`;
			} else {
				const response = await saveProtocolQuery(data);
				await submitProtocolForPublicationQuery(response.protocol_id);
				location.href = `/database/view-protocol/${response.protocol_id}`;
			}
		}
	};

	return (
		<div
			className="ControlButtons"
			style={{ display: "flex", justifyContent: !!sections ? "space-between" : "center" }}
		>
			{!isFirstSection && !!sections && (
				<button type="button" className="secondary" onClick={e => saveAsDraft(true)}>
					{t("go_back")}
				</button>
			)}
			{!isLastSection && (
				<button type="button" className="secondary" onClick={() => saveAsDraft()}>
					{t(
						status === TProtocolStatus.Draft
							? "go_to_next_section_and_save_as_draft"
							: "go_to_next_section"
					)}
				</button>
			)}
			{!!isLastSection && !sections && (
				<button className="secondary" type="submit">
					{t(form.submitText)}
				</button>
			)}
			{!!isLastSection && !!sections && status === TProtocolStatus.Draft && (
				<button type="button" className="secondary" onClick={submitForPublication}>
					{t("submit_for_publication")}
				</button>
			)}
			{!!isLastSection && !!sections && status === TProtocolStatus.SubmittedForPublication && (
				<button type="button" className="secondary" onClick={resubmitForPublication}>
					{t("resubmit_for_publication")}
				</button>
			)}
		</div>
	);
});
