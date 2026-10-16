import { cn } from "@/lib/cn";

/**
 * The breathing lens: the mark scales between 1 and 1.06 over 2.4 s while the second
 * line grows and shrinks, as if the lens reads along. No spinning, no colour change.
 */
export function Loader({ label = "Loading…", size = 72, className }: { label?: string; size?: number; className?: string }) {
	return (
		<div role="status" aria-live="polite" className={cn("flex flex-col items-center gap-4", className)}>
			<svg width={size} height={size} viewBox="0 0 56 56" fill="none" aria-hidden="true" className="animate-breath">
				<path d="M39.5 39.5L49.5 49.5" stroke="#558F99" strokeWidth="6.5" strokeLinecap="round" />
				<circle cx="24" cy="24" r="17.5" fill="#FFFFFF" stroke="#323742" strokeWidth="5" />
				<path d="M16 20.5h16" stroke="#323742" strokeWidth="3.5" strokeLinecap="round" />
				<path
					d="M16 28.5h16"
					stroke="#558F99"
					strokeWidth="3.5"
					strokeLinecap="round"
					className="animate-scan"
					style={{ transformBox: "fill-box", transformOrigin: "left center" }}
				/>
			</svg>
			<span className="font-display text-base font-bold text-ink-muted">{label}</span>
		</div>
	);
}

/** Full-screen overlay in pale teal at 92% opacity. */
export function LoaderOverlay({ label }: { label?: string }) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-teal-50/92">
			<Loader label={label} />
		</div>
	);
}
