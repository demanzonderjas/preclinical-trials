import { observer } from "mobx-react-lite";
import React from "react";
import { useProtocol } from "../../hooks/useProtocol";
import { useTranslationStore } from "../../hooks/useTranslationStore";

export const ProtocolStatus: React.FC = observer(() => {
	const { t } = useTranslationStore();
	const { status, lastUpdatedAt } = useProtocol();
	return (
		<div className="Status">
			<div className="content">
				<span className="publish-status">
					<span className="label">{t("current_status")}:</span> {t(status)}
				</span>
				{lastUpdatedAt && (
					<span className="save-status">
						<span className="label">{t("last_saved_at")}:</span> {lastUpdatedAt}
					</span>
				)}
			</div>
		</div>
	);
});
