// Evaluates isVisible() and formatValue() from protocol-schema.ts for the cases on stdin, so
// ProtocolSchemaTest can compare the PHP port with the original.
import { draftProgress, fieldByKey, formatValue, isVisible, protocolFields } from "../resources/js/data/protocol-schema.ts";

let input = "";
for await (const chunk of process.stdin) input += chunk;
const { valueSets, formats } = JSON.parse(input);

console.log(
	JSON.stringify({
		visible: valueSets.map(values => protocolFields.filter(field => isVisible(field, values)).map(field => field.key)),
		formatted: formats.map(([key, value]) => formatValue(fieldByKey[key], value)),
		progress: valueSets.map(values => {
			const { percent, missing, required, next } = draftProgress(values);
			return { percent, missing, required, next_step: next?.step ?? null };
		})
	})
);
