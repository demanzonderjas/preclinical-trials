import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { useUser } from "../../hooks/useUser";
import {
	createMessageQuery,
	getChannelIdQuery,
	getProtocolMessagesQuery
} from "../../queries/messages";
import { TMessage } from "../../typings/messages";
import cx from "classnames";

export const MessagingContainer: React.FC<{
	close?: Function;
	protocolId?: number;
	initialChannelId?: number;
}> = ({ close, protocolId, initialChannelId }) => {
	const { t } = useTranslationStore();
	const { user } = useUser();
	const [message, setMessage] = useState("");
	const [blocked, setBlocked] = useState(true);
	const [messages, setMessages] = useState<TMessage[]>([]);
	const [channelId, setChannelId] = useState(initialChannelId);
	const messagesRef = useRef(null);

	useEffect(() => {
		if (!user || !protocolId || channelId) {
			return;
		}

		(async () => {
			const response = await getChannelIdQuery(protocolId, user.id);
			setChannelId(response.channel_id);
		})();
	}, [user, protocolId]);

	const getMessages = async (channelId: number) => {
		const response = await getProtocolMessagesQuery(channelId);
		setBlocked(!!response.blocked);
		if (!response.messages || !response.messages.length) {
			return;
		}
		const hasNewMessage = response.messages.length > messages.length;
		setMessages(response.messages);

		if (hasNewMessage) {
			scrollDown();
		}
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

	const scrollDown = () => {
		if (messagesRef.current) {
			messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
		}
	};

	const sendMessage = async () => {
		const response = await createMessageQuery(channelId, message);
		setMessages([...messages, response.message]);
		setMessage("");
		scrollDown();
	};

	return (
		<div className={cx("MessagingContainer", { full_screen: !!initialChannelId })}>
			<div className="header">
				<h2>{t("messages")}</h2>
				{!!close && <span onClick={() => close()}>{t("x")}</span>}
			</div>
			<div className="messages" ref={messagesRef}>
				{messages.map(m => (
					<div className={cx("message", { you: !!m.is_mine })} key={m.id}>
						<div className="content">
							<h3>{t(m.name)}</h3>
							<div className="text" dangerouslySetInnerHTML={{ __html: m.text }} />
							<div className="timestamp">
								<span>{dayjs(m.created_at).format("DD/MM/YYYY hh:mm")}</span>
							</div>
						</div>
					</div>
				))}
			</div>
			{!blocked && (
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
			)}
		</div>
	);
};
