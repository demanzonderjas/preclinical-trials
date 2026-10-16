import { Link } from "@inertiajs/react";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

type MarkProps = {
	size?: number;
	/** The glass is pale teal on white grounds and white on tinted grounds. */
	glass?: "teal" | "white";
	className?: string;
};

/** The lens mark: a magnifier reading two lines of a protocol. */
export function LogoMark({ size = 36, glass = "teal", className }: MarkProps) {
	return (
		<svg width={size} height={size} viewBox="0 0 56 56" fill="none" aria-hidden="true" className={className}>
			<path d="M39.5 39.5L49.5 49.5" stroke="#558F99" strokeWidth="6.5" strokeLinecap="round" />
			<circle cx="24" cy="24" r="17.5" fill={glass === "white" ? "#FFFFFF" : "#E6F0F1"} stroke="#323742" strokeWidth="5" />
			<path d="M16 20.5h16" stroke="#323742" strokeWidth="3.5" strokeLinecap="round" />
			<path d="M16 28.5h9.5" stroke="#558F99" strokeWidth="3.5" strokeLinecap="round" />
		</svg>
	);
}

export function Wordmark({ className }: { className?: string }) {
	return (
		<span className={cn("font-display text-xl font-extrabold leading-none tracking-[-0.035em] text-ink", className)}>
			preclinicaltrials<span className="text-teal-500">.eu</span>
		</span>
	);
}

/** Primary lockup, linking home. */
export function Logo({ glass = "teal", className }: { glass?: MarkProps["glass"]; className?: string }) {
	return (
		<Link
			href={routes.home}
			aria-label="PreclinicalTrials.eu home"
			className={cn("inline-flex shrink-0 items-center gap-2.5 rounded-md hover:text-ink", className)}
		>
			<LogoMark glass={glass} />
			<Wordmark className="max-sm:text-lg" />
		</Link>
	);
}
