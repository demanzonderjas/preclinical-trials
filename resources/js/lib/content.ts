/**
 * Fills the placeholders of an editable text: fill("{count} answers", { count: 42 }).
 * Unknown placeholders stay as they are, so a typo shows on the page instead of vanishing.
 */
export function fill(text: string, values: Record<string, string | number>): string {
	return text.replace(/\{(\w+)\}/g, (match, name: string) => (name in values ? String(values[name]) : match));
}
