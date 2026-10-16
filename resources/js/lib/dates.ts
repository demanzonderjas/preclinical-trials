/**
 * Dates arrive as ISO strings in UTC and are shown in the PCT team's time zone
 * (config/pct.php display_timezone). Month names are fixed here rather than taken from Intl,
 * whose short names differ between ICU versions ("Sep" or "Sept"), so the server render and
 * the browser always agree.
 */
const timeZone = "Europe/Amsterdam";
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const numeric = new Intl.DateTimeFormat("en-GB", { timeZone, year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

type Parts = { year: number; month: number; day: number; hour: string; minute: string };

function parts(value: string | Date): Parts {
	const get = (type: string) => numeric.formatToParts(value instanceof Date ? value : new Date(value)).find(part => part.type === type)?.value ?? "0";
	return { year: Number(get("year")), month: Number(get("month")), day: Number(get("day")), hour: get("hour").padStart(2, "0"), minute: get("minute") };
}

const short = (month: number) => months[month - 1].slice(0, 3);

/** "14 Mar 2027" */
export function formatDate(value: string | Date) {
	const p = parts(value);
	return `${p.day} ${short(p.month)} ${p.year}`;
}

/** "14:32" */
export function formatTime(value: string | Date) {
	const p = parts(value);
	return `${p.hour}:${p.minute}`;
}

/** "Monday 28 September" */
export function formatWeekday(value: string | Date) {
	const p = parts(value);
	return `${weekdays[new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay()]} ${p.day} ${months[p.month - 1]}`;
}

/** Calendar day in the display time zone, "2026-09-28". */
export function dayKey(value: string | Date) {
	const p = parts(value);
	return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

function daysAgo(value: string | Date, now: Date) {
	const [a, b] = [parts(value), parts(now)].map(p => Date.UTC(p.year, p.month - 1, p.day));
	return Math.round((b - a) / 86_400_000);
}

/** "today, 14:32", "yesterday, 09:10", "29 Sep, 11:05", "29 Sep 2025, 11:05" */
export function formatMoment(value: string | Date, now = new Date()) {
	const days = daysAgo(value, now);
	const p = parts(value);
	const time = `${p.hour}:${p.minute}`;
	if (days === 0) return `today, ${time}`;
	if (days === 1) return `yesterday, ${time}`;
	return `${p.year === parts(now).year ? `${p.day} ${short(p.month)}` : formatDate(value)}, ${time}`;
}

/** Short form for lists: "09:12", "Yesterday", "26 Sep", "14 Feb 2025". */
export function formatShort(value: string | Date, now = new Date()) {
	const days = daysAgo(value, now);
	const p = parts(value);
	if (days === 0) return `${p.hour}:${p.minute}`;
	if (days === 1) return "Yesterday";
	return p.year === parts(now).year ? `${p.day} ${short(p.month)}` : formatDate(value);
}

export const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
