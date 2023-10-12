import dayjs from "dayjs";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { useUser } from "../../hooks/useUser";
import {
	createMessageQuery,
	getChannelIdQuery,
	getProtocolMessagesQuery
} from "../../queries/messages";
import { TMessage } from "../../typings/messages";
import cx from "classnames";
import JoditEditor from "jodit-react";
import { joditConfig } from "../../utils/jodit";
import xss from "xss";

export const MessagingContainer: React.FC<{
	close?: Function;
	protocolId?: number;
	initialChannelId?: number;
}> = ({ close, protocolId, initialChannelId }) => {
	const { t } = useTranslationStore();
	const { user } = useUser();
	const [message, setMessage] = useState("");
	const [blocked, setBlocked] = useState(true);
	const editor = useRef(null);
	const [messages, setMessages] = useState<TMessage[]>([]);
	const [channelId, setChannelId] = useState(initialChannelId);
	const messagesRef = useRef(null);

	const config = useMemo(() => ({ ...joditConfig, height: `200px` }), []);

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
							{!m.is_mine && <h3>{t(m.name)}</h3>}
							<div
								className="text"
								dangerouslySetInnerHTML={{ __html: xss(m.text) }}
							/>
							<div className="timestamp">
								<span>{dayjs(m.created_at).format("DD/MM/YYYY hh:mm")}</span>
							</div>
						</div>
					</div>
				))}
			</div>
			{!blocked && (
				<div className="write-message">
					<JoditEditor
						ref={editor}
						value={message}
						config={config}
						onBlur={newContent => setMessage(newContent)}
						onChange={newContent => setMessage(newContent)}
					/>
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
