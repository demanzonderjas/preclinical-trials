import { fieldByKey } from "@/data/protocol-schema";

/** ProtocolSchema::progress() on the server, draftProgress() in the form. */
export type Progress = { percent: number; missing: number; required: number; next_step: number | null };

export type FeedbackStatus = "open" | "addressed" | "resolved";

export const fieldLabel = (key: string) => fieldByKey[key]?.label ?? key.replaceAll("_", " ");

/** "Title, Species and 2 more" */
export function fieldList(keys: string[], max = 2) {
	const labels = keys.map(fieldLabel);
	if (labels.length <= max) return labels.join(" and ");
	return `${labels.slice(0, max).join(", ")} and ${labels.length - max} more`;
}

export type ActivityItem = {
	id: number;
	type: string;
	data: Record<string, unknown>;
	at: string;
	by_me: boolean;
	protocol: { id: number; title: string; pct_id: string | null } | null;
};

/** One line of the audit trail (F6). */
export function activityLabel(item: ActivityItem): string {
	const fields = Array.isArray(item.data.fields) ? (item.data.fields as string[]) : [];
	const points = Number(item.data.points ?? 0);
	switch (item.type) {
		case "submitted":
			return "Submitted for publication";
		case "resubmitted":
			return "Resubmitted for publication";
		case "returned":
			return points ? `Returned with ${points} feedback point${points === 1 ? "" : "s"}` : "Returned with feedback";
		case "published":
			return item.data.pct_id ? `Published as ${item.data.pct_id}` : "Published";
		case "amended":
			return fields.length ? `Amendment recorded · ${fieldList(fields)}` : "Amendment recorded";
		case "addressed":
			return `You addressed feedback · ${fieldList(fields)}`;
		case "imported":
			return `Imported from ${item.data.source ?? "a file"}`;
		case "draft_created":
			return "Draft started";
		case "extension_requested":
			return "Embargo extension requested";
		case "embargo_extended":
			return "Embargo extended";
		case "extension_rejected":
			return "Embargo extension declined";
		case "embargo_lifted":
			return "Embargo ended, details now public";
		default:
			return item.type.replaceAll("_", " ");
	}
}
