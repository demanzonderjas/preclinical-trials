import React from "react";
import { useHistory, useParams } from "react-router-dom";
import { ContentBlock } from "../../components/layout/ContentBlock";
import { Page } from "../../components/layout/Page";
import { MessagingContainer } from "../../components/messaging/MessagingContainer";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { THeaderStyle } from "../../typings/layout";

export const ViewConversationPage: React.FC = () => {
	const { channel_id } = useParams() as any;
	const { push } = useHistory();
	const { t } = useTranslationStore();

	return (
		<Page title="View conversation" headerStyle={THeaderStyle.Primary}>
			<div className="ViewConversation">
				<ContentBlock>
					<div className="button-wrapper" style={{ textAlign: "center" }}>
						<button className="tertiary" onClick={() => push("/dashboard/messages")}>
							{t("back_to_overview")}
						</button>
					</div>
					<MessagingContainer initialChannelId={channel_id} />
				</ContentBlock>
			</div>
		</Page>
	);
};
