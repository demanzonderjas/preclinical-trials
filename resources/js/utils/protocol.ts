import { amendPublishedProtocolForm, createProtocolForm } from "../data/forms/protocol";
import { TFormField, TFormFieldName } from "../typings/forms";
import { TDBProtocol } from "../typings/protocols";

export function fillFieldsWithProtocolDetails(protocol: TDBProtocol): TFormField[] {
	if (!protocol) {
		return [];
	}
	const fields = protocol.details.find(d => d.key === TFormFieldName.WhyAmendment)?.value
		? amendPublishedProtocolForm.fields
		: createProtocolForm.fields;
	return fields.map(f => {
		const matchingDetail = protocol.details.find(detail => detail.key == f.id);
		return { ...f, value: matchingDetail?.value };
	});
}
