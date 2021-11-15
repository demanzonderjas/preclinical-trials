import { TFormFieldName } from "../typings/forms";
import { API } from "../utils/api";

export async function saveProtocolQuery(protocolData: { [K in TFormFieldName]: string }) {
	try {
		const response = await API.post("/api/protocol", protocolData);
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}
