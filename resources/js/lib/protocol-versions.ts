/**
 * Rebuilds earlier versions of a protocol from its current details and the recorded
 * revisions (each revision stores old and new values per changed field).
 *
 * V1 is the protocol as first registered; revision n turns V(n) into V(n + 1); the last
 * version equals the current details.
 */

import { decodeEntities, ESCAPED_HEAD } from "@/lib/rich-text";

export type Change = { key: string; old_value: unknown; new_value: unknown };
export type Version = { date: string | null; time: string | null; reason: string | null; admin_only: boolean; changes: Change[] };

export type Details = Record<string, unknown>;

export function versionCount(versions: Version[]) {
	return versions.length + 1;
}

/** The field values as they were in version `number` (1-based). */
export function valuesAt(current: Details, versions: Version[], number: number): Details {
	const values: Details = { ...current };
	for (let index = versions.length - 1; index >= number - 1; index--) {
		for (const change of versions[index].changes) {
			values[change.key] = change.old_value;
		}
	}
	return values;
}

/** The changes that produced version `number` (none for V1). */
export function changesIn(versions: Version[], number: number): Map<string, Change> {
	const changes = new Map<string, Change>();
	if (number < 2) return changes;
	for (const change of versions[number - 2]?.changes ?? []) {
		changes.set(change.key, change);
	}
	return changes;
}

/**
 * Splits an old and a new text into the part they share at the start and what was added
 * or removed after it, for inline diffs ("kept text" + struck old + added new).
 */
export function textDiff(before: string, after: string): { keep: string; removed: string; added: string } {
	let index = 0;
	while (index < before.length && index < after.length && before[index] === after[index]) {
		index++;
	}
	// Do not cut a word in half.
	const boundary = before.lastIndexOf(" ", index);
	const cut = index === before.length || index === after.length ? index : Math.max(0, boundary + 1);
	return { keep: after.slice(0, cut), removed: before.slice(cut), added: after.slice(cut) };
}


/**
 * Rich text from the legacy editor as plain text with line breaks, so stored HTML is never
 * rendered as markup. Works on the server (SSR) and in the browser.
 */
export function plainText(value: string | null | undefined): string {
	if (!value) return "";
	return value
		.replace(/<!--[\s\S]*?-->/g, "")
		.replace(ESCAPED_HEAD, "")
		.replace(/<(script|style|title|xml)\b[\s\S]*?<\/\1\s*>/gi, "")
		// Word's comment markers ("[E1]").
		.replace(/<a\b[^>]*(#_mso|msocomanchor)[^>]*>[\s\S]*?<\/a>/gi, "")
		.replace(/<\s*br\s*\/?>/gi, "\n")
		.replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
		.replace(/<li[^>]*>/gi, "• ")
		// Only tags: "p<0.05 and n>3" is text.
		.replace(/<\/?[a-z][^<>]*>/gi, "")
		.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, decodeEntities)
		.replace(/\n{3,}/g, "\n\n")
		.trim();
}
