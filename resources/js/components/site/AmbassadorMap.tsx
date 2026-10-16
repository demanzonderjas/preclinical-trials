import { Mail, MapPin, Search } from "lucide-react";
import { useId } from "react";
import world from "@/data/world-dots.json";
import { ButtonAnchor } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

export type Ambassador = {
	id: number;
	number: number;
	name: string;
	description: string;
	city: string | null;
	country: string | null;
	country_code: string | null;
	protocols_in_country: number | null;
	lat: number;
	lng: number;
};

/*
 * A dotted world map (equirectangular) with a pin per ambassador. Ambassadors in
 * the crowded European box are drawn in a magnifying-lens inset instead, as in A2.
 */

const W = 1160;
const H = 470;
const bounds = { west: -168, east: 180, north: 76, south: -56 };
const project = (lng: number, lat: number) => [((lng - bounds.west) / (bounds.east - bounds.west)) * W, ((bounds.north - lat) / (bounds.north - bounds.south)) * H] as const;

const europe = { west: -8, east: 33, north: 63, south: 43 };
const inEurope = (a: Ambassador) => a.lng >= europe.west && a.lng <= europe.east && a.lat >= europe.south && a.lat <= europe.north;

const lens = { cx: 580, cy: 395, r: 158 };
const projectLens = (lng: number, lat: number) => {
	const x = (lng - europe.west) / (europe.east - europe.west);
	const y = (europe.north - lat) / (europe.north - europe.south);
	return [lens.cx - lens.r * 0.95 + x * lens.r * 1.9, lens.cy - lens.r * 0.6 + y * lens.r * 1.2] as const;
};
const europeCentre = project((europe.west + europe.east) / 2, (europe.north + europe.south) / 2);

export function AmbassadorMap({ ambassadors, selected, onSelect }: { ambassadors: Ambassador[]; selected: Ambassador | null; onSelect: (a: Ambassador) => void }) {
	const clipId = useId();
	const european = ambassadors.filter(inEurope);
	const elsewhere = ambassadors.filter(a => !inEurope(a));
	const dotSize = (world.step / (bounds.east - bounds.west)) * W * 0.42;

	return (
		<div className="relative">
			<svg viewBox={`0 0 ${W} ${H + 90}`} className="h-auto w-full" role="group" aria-label="Map of ambassadors">
				<g aria-hidden="true" fill="#83B2BA" opacity="0.55">
					{world.dots.map(([lng, lat], index) => {
						const [x, y] = project(lng, lat);
						return <circle key={index} cx={x} cy={y} r={dotSize} />;
					})}
				</g>

				{european.length > 0 && (
					<g aria-hidden="true">
						<circle cx={europeCentre[0]} cy={europeCentre[1]} r="62" fill="none" stroke="#558F99" strokeWidth="1.5" strokeDasharray="5 6" />
						<line x1={europeCentre[0]} y1={europeCentre[1] + 62} x2={lens.cx} y2={lens.cy - lens.r} stroke="#558F99" strokeWidth="1.5" strokeDasharray="5 6" />
						{european.map(a => {
							const [x, y] = project(a.lng, a.lat);
							return <circle key={a.id} cx={x} cy={y} r="4" fill="#FFA888" />;
						})}
					</g>
				)}

				{elsewhere.map(a => {
					const [x, y] = project(a.lng, a.lat);
					return <Pin key={a.id} a={a} x={x} y={y} active={selected?.id === a.id} onSelect={onSelect} />;
				})}

				{european.length > 0 && (
					<g>
						<clipPath id={clipId}>
							<circle cx={lens.cx} cy={lens.cy} r={lens.r} />
						</clipPath>
						<circle cx={lens.cx} cy={lens.cy} r={lens.r} fill="#FFFFFF" />
						<g clipPath={`url(#${clipId})`} aria-hidden="true" fill="#83B2BA" opacity="0.55">
							{world.europe.map(([lng, lat], index) => {
								const [x, y] = projectLens(lng, lat);
								return <circle key={index} cx={x} cy={y} r="2.1" />;
							})}
						</g>
						<circle cx={lens.cx} cy={lens.cy} r={lens.r} fill="none" stroke="#323742" strokeWidth="9" />
						<path d={`M${lens.cx + lens.r * 0.72} ${lens.cy + lens.r * 0.72}l38 38`} stroke="#558F99" strokeWidth="14" strokeLinecap="round" />
						{placeLabels(spread(european.map(a => ({ a, xy: projectLens(a.lng, a.lat) }))), lens.cx + lens.r - 12).map(({ a, xy, labelLeft }) => (
							<Pin key={a.id} a={a} x={xy[0]} y={xy[1]} active={selected?.id === a.id} onSelect={onSelect} small labelLeft={labelLeft} />
						))}
					</g>
				)}
			</svg>
			{european.length > 0 && (
				<p className="absolute top-2 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[13.5px] font-bold shadow-[inset_0_0_0_1px_var(--color-line)] md:inline-flex">
					<span className="flex size-5 items-center justify-center rounded-full bg-peach-300 text-[11px]">{european.length}</span>
					Europe, magnified below
				</p>
			)}
		</div>
	);
}

/**
 * Puts a pin's label on the left when, on the right, it would run into another pin or a
 * label placed before it.
 */
function placeLabels<T extends { a: Ambassador; xy: readonly [number, number] }>(pins: T[], rightEdge: number): (T & { labelLeft: boolean })[] {
	const width = (pin: T) => (pin.a.city?.length ?? 0) * 8 + 24;
	return pins.map(pin => {
		const [x, y] = pin.xy;
		const blocked = pins.some(other => other !== pin && Math.abs(other.xy[1] - y) < 24 && other.xy[0] > x && other.xy[0] - x < width(pin));
		return { ...pin, labelLeft: blocked || x + width(pin) > rightEdge };
	});
}

/** Nudges pins that would cover each other (Amsterdam and Utrecht) apart. */
function spread<T extends { xy: readonly [number, number] }>(pins: T[], gap = 30): T[] {
	const result = pins.map(pin => ({ ...pin, xy: [pin.xy[0], pin.xy[1]] as [number, number] }));
	for (let i = 0; i < result.length; i++) {
		for (let j = i + 1; j < result.length; j++) {
			const [ax, ay] = result[i].xy;
			const [bx, by] = result[j].xy;
			const distance = Math.hypot(bx - ax, by - ay);
			if (distance < gap) {
				const angle = distance ? Math.atan2(by - ay, bx - ax) : Math.PI / 4;
				const push = (gap - distance) / 2;
				result[i].xy = [ax - Math.cos(angle) * push, ay - Math.sin(angle) * push];
				result[j].xy = [bx + Math.cos(angle) * push, by + Math.sin(angle) * push];
			}
		}
	}
	return result;
}

function Pin({ a, x, y, active, onSelect, small = false, labelLeft = false }: { a: Ambassador; x: number; y: number; active: boolean; onSelect: (a: Ambassador) => void; small?: boolean; labelLeft?: boolean }) {
	const r = small ? 13 : 15;
	return (
		<g
			role="button"
			tabIndex={0}
			aria-label={`${a.city ?? a.name}: ${a.name}`}
			aria-pressed={active}
			onClick={() => onSelect(a)}
			onKeyDown={event => (event.key === "Enter" || event.key === " ") && (event.preventDefault(), onSelect(a))}
			className="cursor-pointer outline-none [&:focus-visible>circle:first-child]:stroke-[#2C6FAA]"
		>
			{active && <circle cx={x} cy={y} r={r + 10} fill="#FFE2D7" />}
			<circle cx={x} cy={y} r={r} fill="#FFA888" stroke={active ? "#323742" : "#FFFFFF"} strokeWidth={active ? 3 : 2} />
			<text x={x} y={y + 5} textAnchor="middle" fontSize={small ? 13 : 15} fontWeight="800" fontFamily="Manrope Variable, Manrope, sans-serif" fill="#323742">
				{a.number}
			</text>
			{a.city && (
				<text x={labelLeft ? x - r - 6 : x + r + 6} y={y + 5} textAnchor={labelLeft ? "end" : "start"} fontSize={small ? 15 : 18} fontWeight="700" fontFamily="Source Sans 3 Variable, sans-serif" fill="#323742" paintOrder="stroke" stroke={small ? "#FFFFFF" : "#F3F7F8"} strokeWidth="5">
					{a.city}
				</text>
			)}
		</g>
	);
}

export function AmbassadorCard({ a }: { a: Ambassador }) {
	const initials = a.name
		.replace(/^(Prof\.|Dr\.)\s*/g, "")
		.split(/\s+/)
		.filter(word => /^[A-Z]/.test(word))
		.map(word => word[0])
		.slice(0, 2)
		.join("");
	return (
		<div className="rounded-card bg-white p-5.5 shadow-raised">
			<div className="flex items-start gap-3.5">
				<span aria-hidden="true" className="flex size-13 shrink-0 items-center justify-center rounded-full bg-peach-100 font-display text-lg font-extrabold">
					{initials}
				</span>
				<div>
					<p className="flex items-center gap-1.5 text-[14px] font-semibold text-ink-muted">
						<MapPin size={14} strokeWidth={2.2} className="text-teal-500" aria-hidden="true" />
						{[a.city, a.country].filter(Boolean).join(", ")}
					</p>
					<p className="font-display text-xl leading-snug font-bold">{a.name}</p>
				</div>
			</div>
			{a.description && <p className="mt-3 text-[15px] leading-normal text-ink-muted">{a.description}</p>}
			{!!a.protocols_in_country && a.country && (
				<p className="mt-3 rounded-input bg-mist px-3.5 py-2.5 text-[14.5px]">
					<strong>{a.protocols_in_country} public protocols</strong> come from study centres in {a.country}.
				</p>
			)}
			<div className="mt-4 flex flex-wrap gap-2.5">
				<ButtonAnchor href={`${routes.contact}?topic=ambassador`} size="sm" icon={<Mail size={16} strokeWidth={2.2} aria-hidden="true" />}>
					Get in touch
				</ButtonAnchor>
				{a.country_code && (
					<ButtonAnchor href={`${routes.database}?country[]=${a.country_code}`} size="sm" variant="secondary" icon={<Search size={16} strokeWidth={2.2} aria-hidden="true" />}>
						Their country’s protocols
					</ButtonAnchor>
				)}
			</div>
		</div>
	);
}

export function AmbassadorList({ ambassadors, selected, onSelect }: { ambassadors: Ambassador[]; selected: Ambassador | null; onSelect: (a: Ambassador) => void }) {
	return (
		<ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
			{ambassadors.map(a => (
				<li key={a.id}>
					<button
						type="button"
						aria-pressed={selected?.id === a.id}
						onClick={() => onSelect(a)}
						className={cn(
							"flex h-full w-full flex-col rounded-card bg-white p-4 text-left",
							selected?.id === a.id ? "shadow-[inset_0_0_0_2px_var(--color-teal-500)]" : "shadow-[inset_0_0_0_1px_var(--color-line)] hover:shadow-[inset_0_0_0_1.5px_var(--color-teal-300)]"
						)}
					>
						<span className="flex items-start gap-2.5">
							<span className={cn("flex size-6.5 shrink-0 items-center justify-center rounded-full font-display text-[12px] font-extrabold", selected?.id === a.id ? "bg-peach-300" : "bg-mist")}>{a.number}</span>
							<span>
								<span className="block font-display text-[17px] leading-tight font-bold">{a.city}</span>
								<span className="block text-[13.5px] text-ink-muted">{a.country}</span>
							</span>
						</span>
						<span className="mt-3 block text-[15px] leading-snug font-bold">{a.name}</span>
						<span className="mt-1 line-clamp-2 text-[14px] text-ink-muted">{a.description}</span>
					</button>
				</li>
			))}
		</ul>
	);
}
