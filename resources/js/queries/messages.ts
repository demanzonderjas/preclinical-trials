import { API } from "../utils/api";

export async function getProtocolMessagesQuery(channel_id: number) {
	try {
		const response = await API.post("/api/channel/messages", { channel_id });
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function getChannelIdQuery(protocol_id: number, questioner_id: number) {
	try {
		const response = await API.post("/api/channel/id", { protocol_id, questioner_id });
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function getProtocolIdViaChannelQuery(channel_id: number) {
	try {
		const response = await API.post("/api/channel/get-protocol-id", { channel_id });
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function createMessageQuery(channel_id: number, text: string) {
	try {
		const response = await API.post("/api/channel/message", { channel_id, text });
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function getMyChannelsQuery() {
	try {
		const response = await API.get("/api/channels/mine");
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function toggleBlockChannelQuery(channel_id: number) {
	try {
		const response = await API.post("/api/channel/block", { channel_id });
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}
