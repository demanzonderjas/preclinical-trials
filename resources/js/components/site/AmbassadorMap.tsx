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
 * A dotted world map (equirectangular) with a pin per ambassador. A magnifying lens rests
 * on the selected ambassador and glides to the next one, so the crowded European cities
 * can be told apart wherever you look.
 */

const W = 1160;
const H = 470;
const VIEW_H = H + 40;
const bounds = { west: -168, east: 180, north: 76, south: -56 };
const project = (lng: number, lat: number) => [((lng - bounds.west) / (bounds.east - bounds.west)) * W, ((bounds.north - lat) / (bounds.north - bounds.south)) * H] as const;

/** Where the dense dots of world.europe apply; elsewhere the coarse world dots do. */
const europe = { west: -16, east: 39.8, north: 70, south: 34 };
const inEurope = (a: Ambassador) => a.lng >= -8 && a.lng <= 33 && a.lat >= 43 && a.lat <= 63;
const inDenseArea = ([lng, lat]: number[]) => lng >= europe.west && lng <= europe.east && lat >= europe.south && lat <= europe.north;

const LENS_R = 92;
const ZOOM = 2.2;
const MOTION = "motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]";
const px = (x: number, y: number) => `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;

export function AmbassadorMap({ ambassadors, selected, onSelect }: { ambassadors: Ambassador[]; selected: Ambassador | null; onSelect: (a: Ambassador) => void }) {
	const clipId = useId();
	const european = ambassadors.filter(inEurope);
	const elsewhere = ambassadors.filter(a => !inEurope(a));
	const dotSize = (world.step / (bounds.east - bounds.west)) * W * 0.42;

	// The lens looks at the selected ambassador (or Europe), and sits on it unless that
	// would push it off the map.
	const focus = selected ? project(selected.lng, selected.lat) : project(10, 51);
	const centre = [Math.min(W - LENS_R - 10, Math.max(LENS_R + 10, focus[0])), Math.min(VIEW_H - LENS_R - 30, Math.max(LENS_R + 10, focus[1]))] as const;

	// Pins in the lens, magnified around the focus: the selected city sits in the middle and
	// only its neighbours are nudged aside where they would touch.
	const inLens = placeLabels(
		spread(
			ambassadors.map(a => {
				const [x, y] = project(a.lng, a.lat);
				return { a, xy: [(x - focus[0]) * ZOOM, (y - focus[1]) * ZOOM] as const };
			}),
			30,
			ambassadors.findIndex(a => a.id === selected?.id)
		),
		LENS_R - 12
	).map(pin => ({ ...pin, visible: Math.hypot(pin.xy[0], pin.xy[1]) < LENS_R - 10 }));

	return (
		<div className="relative">
			<svg viewBox={`0 0 ${W} ${VIEW_H}`} className="h-auto w-full" role="group" aria-label="Map of ambassadors">
				<g aria-hidden="true" fill="#83B2BA" opacity="0.55">
					{world.dots.map(([lng, lat], index) => {
						const [x, y] = project(lng, lat);
						return <circle key={index} cx={x} cy={y} r={dotSize} />;
					})}
				</g>

				{elsewhere.map(a => {
					const [x, y] = project(a.lng, a.lat);
					return <Pin key={a.id} a={a} x={x} y={y} active={selected?.id === a.id} onSelect={onSelect} />;
				})}
				{/* European cities are too close for full pins: small dots, magnified in the lens. */}
				{european.map(a => {
					const [x, y] = project(a.lng, a.lat);
					return <Dot key={a.id} a={a} x={x} y={y} active={selected?.id === a.id} onSelect={onSelect} />;
				})}

				<g className={MOTION} style={{ transform: px(centre[0], centre[1]) }}>
					<clipPath id={clipId}>
						<circle r={LENS_R} />
					</clipPath>
					<circle r={LENS_R + 3} fill="#FFFFFF" />
					<g clipPath={`url(#${clipId})`}>
						<g className={MOTION} style={{ transform: `scale(${ZOOM}) ${px(-focus[0], -focus[1])}` }} aria-hidden="true" fill="#83B2BA" opacity="0.55">
							{world.dots
								.filter(dot => !inDenseArea(dot))
								.map(([lng, lat], index) => {
									const [x, y] = project(lng, lat);
									return <circle key={index} cx={x} cy={y} r={3 / ZOOM} />;
								})}
							{world.europe.map(([lng, lat], index) => {
								const [x, y] = project(lng, lat);
								return <circle key={`e${index}`} cx={x} cy={y} r={2.1 / ZOOM} />;
							})}
						</g>
						<g>
							{inLens.map(({ a, xy, labelLeft, visible }) => (
								<g key={a.id} className={MOTION} style={{ transform: px(xy[0], xy[1]) }} aria-hidden={!visible}>
									<Pin a={a} x={0} y={0} active={selected?.id === a.id} onSelect={onSelect} small labelLeft={labelLeft} focusable={visible} />
								</g>
							))}
						</g>
					</g>
					<circle r={LENS_R} fill="none" stroke="#323742" strokeWidth="6" />
					<path d={`M${LENS_R * 0.71 + 2} ${LENS_R * 0.71 + 2}l22 22`} stroke="#558F99" strokeWidth="9" strokeLinecap="round" />
				</g>
			</svg>
		</div>
	);
}

/** A European ambassador on the world map: too close to their neighbours for a full pin. */
function Dot({ a, x, y, active, onSelect }: { a: Ambassador; x: number; y: number; active: boolean; onSelect: (a: Ambassador) => void }) {
	return (
		<g
			role="button"
			tabIndex={-1}
			aria-label={`${a.city ?? a.name}: ${a.name}`}
			onClick={() => onSelect(a)}
			className="cursor-pointer outline-none"
		>
			<circle cx={x} cy={y} r="9" fill="transparent" />
			<circle cx={x} cy={y} r={active ? 5 : 4} fill="#FFA888" stroke="#FFFFFF" strokeWidth="1.5" />
		</g>
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

/** Nudges pins that would cover each other (Amsterdam and Utrecht) apart; the pin at `fixed` stays put. */
function spread<T extends { xy: readonly [number, number] }>(pins: T[], gap = 30, fixed = -1): T[] {
	const result = pins.map(pin => ({ ...pin, xy: [pin.xy[0], pin.xy[1]] as [number, number] }));
	for (let i = 0; i < result.length; i++) {
		for (let j = i + 1; j < result.length; j++) {
			const [ax, ay] = result[i].xy;
			const [bx, by] = result[j].xy;
			const distance = Math.hypot(bx - ax, by - ay);
			if (distance < gap) {
				const angle = distance ? Math.atan2(by - ay, bx - ax) : Math.PI / 4;
				const push = gap - distance;
				const share = i === fixed ? 0 : j === fixed ? 1 : 0.5;
				result[i].xy = [ax - Math.cos(angle) * push * share, ay - Math.sin(angle) * push * share];
				result[j].xy = [bx + Math.cos(angle) * push * (1 - share), by + Math.sin(angle) * push * (1 - share)];
			}
		}
	}
	return result;
}

function Pin({ a, x, y, active, onSelect, small = false, labelLeft = false, focusable = true }: { a: Ambassador; x: number; y: number; active: boolean; onSelect: (a: Ambassador) => void; small?: boolean; labelLeft?: boolean; focusable?: boolean }) {
	const r = small ? 13 : 15;
	return (
		<g
			role="button"
			tabIndex={focusable ? 0 : -1}
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
