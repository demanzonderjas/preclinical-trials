import { observer } from "mobx-react-lite";
import React from "react";
import { useHistory } from "react-router";
import { useRevisions } from "../../hooks/useRevisions";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { GenericSelectField } from "../forms/SelectField";
import day from "dayjs";

export const RevisionPanel: React.FC = observer(() => {
	const { goBack, push } = useHistory();
	const { t } = useTranslationStore();
	const revisionStore = useRevisions();

	const back = (e: any) => {
		e.preventDefault();
		goBack();
	};

	if (!revisionStore || !revisionStore.protocol) {
		return null;
	}

	const { setActiveRevision, activeRevisionDate, protocol } = revisionStore;

	const hasRevisions = !!protocol.revisions && !!protocol.revisions.length;
	const revisionDates = hasRevisions
		? protocol.revisions.map(
				(r, idx) => `V${idx + 1} - ${day(r.created_at).format("DD/MM/YYYY hh:mm")}`
		  )
		: [];

	return (
		<div className="RevisionPanel">
			<div className="actions">
				<button
					className="tertiary small"
					onClick={e => {
						e.preventDefault();
						push(`/dashboard/edit-protocol/${protocol.id}`);
					}}
				>
					{t("edit")}
				</button>
				<button className="tertiary small" onClick={back}>
					{t("go_back")}
				</button>
			</div>
			<div className="revisions">
				{!hasRevisions && <div className="version">{t("current_version")}</div>}
				{hasRevisions && (
					<GenericSelectField
						emptyPlaceholder="current_version"
						options={revisionDates}
						setValue={value => setActiveRevision(value)}
						value={activeRevisionDate}
					/>
				)}
			</div>
		</div>
	);
});
