import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { useParams } from "react-router";
import { useForm } from "../../../hooks/useForm";
import { useProtocol } from "../../../hooks/useProtocol";
import { useTranslationStore } from "../../../hooks/useTranslationStore";
import {
	saveProtocolQuery,
	submitProtocolForPublicationQuery,
	updateProtocolQuery
} from "../../../queries/protocol";
import { TAlignment } from "../../../typings/forms";
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
	const [isSubmitting, setIsSubmitting] = useState(false);

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
				? getSectionByIndex(activeSection) - 1
				: getSectionByIndex(activeSection) + 1;
			location.href = `/dashboard/edit-protocol/${protocolId}#${nextSectionIndex}`;
		}
	};

	const submitForPublication = async () => {
		setIsSubmitting(true);
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
		setIsSubmitting(false);
	};

	return (
		<div
			className="ControlButtons"
			style={{
				display: "flex",
				justifyContent:
					!!sections || form.align === TAlignment.Left ? "space-between" : "center"
			}}
		>
			{!isFirstSection && !!sections && (
				<button type="button" className="secondary small" onClick={e => saveAsDraft(true)}>
					{t("go_back")}
				</button>
			)}
			{!isLastSection && (
				<button type="button" className="secondary small" onClick={() => saveAsDraft()}>
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
				<button
					type="button"
					disabled={isSubmitting}
					className="secondary small"
					onClick={submitForPublication}
				>
					{t("submit_for_publication")}
				</button>
			)}
			{!!isLastSection &&
				!!sections &&
				(status === TProtocolStatus.SubmittedForPublication ||
					status === TProtocolStatus.Rejected ||
					status === TProtocolStatus.Published) && (
					<button
						type="button"
						disabled={isSubmitting}
						className="secondary small"
						onClick={submitForPublication}
					>
						{t(
							status === TProtocolStatus.Published
								? "submit_with_amendment"
								: "resubmit_for_publication"
						)}
					</button>
				)}
		</div>
	);
});
