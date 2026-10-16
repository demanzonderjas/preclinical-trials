import type { ReactNode } from "react";
import { formatValue, type ProtocolField } from "@/data/protocol-schema";
import { plainText } from "@/lib/protocol-versions";

/** A stored answer as the PCT team reads it: text, arms and centres as tables, image counts. */
export function display(field: ProtocolField, value: unknown): ReactNode {
	if (field.type === "study_arms") {
		const arms = (Array.isArray(value) ? value : []) as { type?: string; number?: string | number; intervention?: string }[];
		if (!arms.length) return null;
		const total = arms.reduce((sum, arm) => sum + (Number(arm.number) || 0), 0);
		return (
			<>
				<table className="w-full text-left text-[15px]">
					<thead>
						<tr>
							{["Type", "Number", "Intervention"].map(header => (
								<th key={header} scope="col" className="eyebrow pb-2 text-[11.5px]">
									{header}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{arms.map((arm, index) => (
							<tr key={index} className="border-t border-teal-50 align-top">
								<td className="py-2 pr-3">{arm.type ? arm.type.charAt(0).toUpperCase() + arm.type.slice(1) : ""}</td>
								<td className="py-2 pr-3 font-bold">{arm.number}</td>
								<td className="py-2">{arm.intervention}</td>
							</tr>
						))}
					</tbody>
				</table>
				<p className="mt-2 text-[14px] text-ink-muted">
					Arms add up to <strong className="text-ink">{total}</strong>
				</p>
			</>
		);
	}
	if (field.type === "study_centres") {
		const centres = (Array.isArray(value) ? value : []) as { name?: string; city?: string; country?: string }[];
		return centres.length ? centres.map((centre, index) => <span key={index} className="block">{[centre.name, centre.city, centre.country].filter(Boolean).join(", ")}</span>) : null;
	}
	if (field.type === "image" || field.type === "images") {
		const files = Array.isArray(value) ? value : value ? [value] : [];
		return files.length ? `${files.length} image${files.length === 1 ? "" : "s"}` : null;
	}
	const text = field.type === "longtext" && typeof value === "string" ? plainText(value) : formatValue(field, value);
	return text || null;
}
