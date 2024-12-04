import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { ContentBlock } from "../../components/layout/ContentBlock";
import { Page } from "../../components/layout/Page";
import { MessagingContainer } from "../../components/messaging/MessagingContainer";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { THeaderStyle } from "../../typings/layout";
import { getChannelIdQuery, getProtocolIdViaChannelQuery } from "../../queries/messages";

export const ViewConversationPage: React.FC = () => {
	const { channel_id } = useParams() as any;
	const { push } = useHistory();
	const { t } = useTranslationStore();
	const [protocolId, setProtocolId] = useState(null);

	useEffect(() => {
		(async () => {
			const response = await getProtocolIdViaChannelQuery(channel_id);
			setProtocolId(response.protocol_id);
		})();
	}, [channel_id]);

	return (
		<Page title="View conversation" headerStyle={THeaderStyle.Primary} needsVerification={true}>
			<div className="ViewConversation">
				<ContentBlock>
					<div className="button-wrapper" style={{ textAlign: "center" }}>
						<button className="tertiary" onClick={() => push("/dashboard/messages")}>
							{t("back_to_overview")}
						</button>
					</div>
					<MessagingContainer protocolId={protocolId} initialChannelId={channel_id} />
				</ContentBlock>
			</div>
		</Page>
	);
};
