import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { useUser } from "../../hooks/useUser";
import {
	createMessageQuery,
	getChannelIdQuery,
	getProtocolMessagesQuery
} from "../../queries/messages";
import { TMessage } from "../../typings/messages";
import cx from "classnames";

export const MessagingContainer: React.FC<{ close: Function; protocolId: number }> = ({
	close,
	protocolId
}) => {
	const { t } = useTranslationStore();
	const { user } = useUser();
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState<TMessage[]>([]);
	const [channelId, setChannelId] = useState(null);

	useEffect(() => {
		if (!user || !protocolId) {
			return;
		}

		(async () => {
			const response = await getChannelIdQuery(protocolId, user.id);
			setChannelId(response.channel_id);
		})();
	}, [user, protocolId]);

	const getMessages = async (channelId: number) => {
		const response = await getProtocolMessagesQuery(channelId);
		setMessages(response.messages);
	};

	useEffect(() => {
		if (!channelId) {
			return;
		}

		const pollId = setInterval(() => {
			getMessages(channelId);
		}, 20000);
		getMessages(channelId);

		return () => {
			clearInterval(pollId);
		};
	}, [channelId]);

	const sendMessage = async () => {
		const response = await createMessageQuery(channelId, message);
		setMessages([...messages, response.message]);
		setMessage("");
	};

	return (
		<div className="MessagingContainer">
			<div className="header">
				<h2>{t("ask_question")}</h2>
				<span onClick={() => close()}>{t("x")}</span>
			</div>
			<div className="messages">
				{messages.map(m => (
					<div className={cx("message", { you: !!m.is_mine })} key={m.id}>
						<div className="content">
							<h3>{m.name}</h3>
							<div className="text" dangerouslySetInnerHTML={{ __html: m.text }} />
							<div className="timestamp">
								<span>{dayjs(m.created_at).format("DD/MM/YYYY hh:mm")}</span>
							</div>
						</div>
					</div>
				))}
			</div>
			<div className="write-message">
				<textarea value={message} onChange={e => setMessage(e.target.value)} />
				<div className="button-wrapper">
					<button
						className="secondary small"
						onClick={sendMessage}
						disabled={!message.length}
					>
						{t("send_message")}
					</button>
				</div>
			</div>
		</div>
	);
};
