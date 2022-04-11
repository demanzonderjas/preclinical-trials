import { observer } from "mobx-react-lite";
import React from "react";
import { useHistory } from "react-router";
import { useRevisions } from "../../hooks/useRevisions";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { GenericSelectField } from "../forms/SelectField";
import day from "dayjs";
import { getRevisionDate } from "../../utils/formatting";
import { useUser } from "../../hooks/useUser";

export const RevisionPanel: React.FC<{ hideBack?: boolean }> = observer(({ hideBack }) => {
	const { goBack, push } = useHistory();
	const { t } = useTranslationStore();
	const { isMine } = useUser();
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
		? protocol.revisions.map((r, idx) => getRevisionDate(r.created_at, idx + 1))
		: [];

	return (
		<div className="RevisionPanel">
			<div className="actions">
				{isMine(protocol.user_id) && (
					<button
						className="tertiary small"
						onClick={e => {
							e.preventDefault();
							push(`/dashboard/edit-protocol/${protocol.id}`);
						}}
					>
						{t("edit")}
					</button>
				)}
				{!hideBack && (
					<button className="tertiary small" onClick={back}>
						{t("go_back")}
					</button>
				)}
			</div>
			<div className="revisions">
				{!hasRevisions && <div className="version">{t("current_version")}</div>}
				{hasRevisions && (
					<GenericSelectField
						emptyPlaceholder="current_version"
						clearPlaceholder="clear_revision"
						options={revisionDates}
						setValue={value => setActiveRevision(value)}
						value={activeRevisionDate}
					/>
				)}
			</div>
		</div>
	);
});
