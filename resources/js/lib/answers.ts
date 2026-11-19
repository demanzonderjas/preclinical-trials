/**
 * Compares protocol answers by what they say, not by how they were serialised. The
 * TypeScript namesake of App\Support\Answers; tests/js/answers.test.ts and AnswersTest keep
 * them in step.
 *
 * The answers the reviewer saw come back from a MySQL JSON column with object keys sorted,
 * so a study centre {name, city, country} returns as {city, name, country}: compared as JSON
 * text it always looked changed. Normalised: object keys sorted, list order kept, numbers
 * as text, strings trimmed with "\r\n" made "\n", and "", null, [] and blank rows all count
 * as no answer.
 */
export function normaliseAnswer(value: unknown): unknown {
	if (Array.isArray(value)) {
		const items = value.map(normaliseAnswer).filter(item => item !== null);
		return items.length ? items : null;
	}
	if (value !== null && typeof value === "object") {
		const entries = Object.keys(value)
			.sort()
			.map(key => [key, normaliseAnswer((value as Record<string, unknown>)[key])] as const)
			.filter(([, item]) => item !== null);
		return entries.length ? Object.fromEntries(entries) : null;
	}
	if (typeof value === "string") {
		const text = value.replace(/\r\n?/g, "\n").trim();
		return text === "" ? null : text;
	}
	if (typeof value === "number" || typeof value === "boolean") return String(value);
	return value ?? null;
}

/** Whether two answers say the same. */
export function sameAnswer(before: unknown, after: unknown): boolean {
	return stableJson(normaliseAnswer(before)) === stableJson(normaliseAnswer(after));
}

/** JSON with object keys in order (normaliseAnswer already sorted them; Object.fromEntries keeps that order except for integer-like keys). */
function stableJson(value: unknown): string {
	if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
	if (value !== null && typeof value === "object") {
		return `{${Object.keys(value)
			.sort()
			.map(key => `${JSON.stringify(key)}:${stableJson((value as Record<string, unknown>)[key])}`)
			.join(",")}}`;
	}
	return JSON.stringify(value);
}
