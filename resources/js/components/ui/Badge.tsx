import { Check, Lock } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone =
	/** Mist with a grey dot: draft, neutral study statuses. */
	| "neutral"
	/** Blue tint: submitted. */
	| "blue"
	/** Blue outline: resubmitted. */
	| "blue-outline"
	/** Pale teal: species and other soft chips. */
	| "teal"
	/** Pale teal with a teal ring: published. */
	| "teal-ring"
	/** Peach tint: needs changes, "before study start". */
	| "peach"
	/** White with a slate outline: embargo. */
	| "outline";

const tones: Record<BadgeTone, string> = {
	neutral: "bg-mist shadow-[inset_0_0_0_1px_var(--color-line)]",
	blue: "bg-blue-100",
	"blue-outline": "bg-white shadow-[inset_0_0_0_1.5px_var(--color-blue-400)]",
	teal: "bg-teal-50",
	"teal-ring": "bg-teal-50 shadow-[inset_0_0_0_1px_var(--color-teal-200)]",
	peach: "bg-peach-100",
	outline: "bg-white shadow-[inset_0_0_0_1px_var(--color-line-strong)]"
};

type BadgeProps = {
	tone?: BadgeTone;
	/** A small status dot in front of the label. */
	dot?: "grey" | "peach" | "teal";
	icon?: ReactNode;
	size?: "sm" | "md";
	className?: string;
	children: ReactNode;
};

const dots = { grey: "bg-line-strong", peach: "bg-peach-300", teal: "bg-teal-500" };

export function Badge({ tone = "teal", dot, icon, size = "md", className, children }: BadgeProps) {
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1.5 rounded-full font-bold whitespace-nowrap text-ink",
				size === "md" ? "h-7 px-3 text-xs" : "h-6.5 px-2.5 text-[13px]",
				tones[tone],
				className
			)}
		>
			{dot && <span aria-hidden="true" className={cn("size-[7px] rounded-full", dots[dot])} />}
			{icon}
			{children}
		</span>
	);
}

export type ProtocolStatus = "draft" | "submitted_for_publication" | "resubmitted_for_publication" | "published" | "rejected";

const statusBadges: Record<ProtocolStatus, { label: string; tone: BadgeTone; dot?: "grey"; icon?: ReactNode }> = {
	draft: { label: "Draft", tone: "neutral", dot: "grey" },
	submitted_for_publication: { label: "Submitted for publication", tone: "blue" },
	resubmitted_for_publication: { label: "Resubmitted for publication", tone: "blue-outline" },
	published: { label: "Published", tone: "teal-ring", icon: <Check size={12} strokeWidth={2.8} aria-hidden="true" /> },
	rejected: { label: "Needs changes", tone: "peach" }
};

/** The registration status of a protocol. */
export function StatusBadge({ status, className }: { status: ProtocolStatus; className?: string }) {
	const badge = statusBadges[status];
	return (
		<Badge tone={badge.tone} dot={badge.dot} icon={badge.icon} className={className}>
			{badge.label}
		</Badge>
	);
}

export function EmbargoBadge({ until, className }: { until: string; className?: string }) {
	return (
		<Badge tone="outline" icon={<Lock size={12} strokeWidth={2.4} aria-hidden="true" />} className={className}>
			Embargo until {until}
		</Badge>
	);
}

/** A count bubble, as on the "My protocols" and "Messages" tabs. */
export function CountBubble({ count, tone = "teal", label }: { count: number; tone?: "teal" | "peach"; label?: string }) {
	return (
		<span
			aria-label={label}
			className={cn(
				"inline-flex h-5.5 min-w-5.5 items-center justify-center rounded-full px-[7px] font-display text-[12px] font-extrabold text-ink",
				tone === "peach" ? "bg-peach-300" : "bg-teal-50"
			)}
		>
			{count}
		</span>
	);
}
