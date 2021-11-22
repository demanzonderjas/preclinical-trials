import { createProtocolForm } from "../data/forms/protocol";
import { TFormField } from "../typings/forms";
import { TDBProtocol } from "../typings/protocols";

export function fillFieldsWithProtocolDetails(protocol: TDBProtocol): TFormField[] {
	if (!protocol) {
		return [];
	}
	return createProtocolForm.fields.map(f => {
		const matchingDetail = protocol.details.find(detail => detail.key == f.id);
		return { ...f, value: matchingDetail?.value };
	});
}
