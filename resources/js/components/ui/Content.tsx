import { ArrowRight, Info } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Eyebrow, heading and an optional lead, as used to open every section. */
export function SectionHeading({
	eyebrow,
	title,
	lead,
	as: Heading = "h2",
	size = "lg",
	className,
	aside
}: {
	eyebrow?: ReactNode;
	title: ReactNode;
	lead?: ReactNode;
	as?: "h1" | "h2" | "h3";
	size?: "md" | "lg" | "xl";
	className?: string;
	/** Shown to the right on wide screens (a link or short text). */
	aside?: ReactNode;
}) {
	return (
		<div className={cn("flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between", className)}>
			<div className="max-w-3xl">
				{eyebrow && <p className="eyebrow">{eyebrow}</p>}
				<Heading
					className={cn(
						"font-extrabold tracking-[-0.03em]",
						eyebrow && "mt-3.5",
						size === "md" && "text-2xl leading-tight sm:text-3xl",
						size === "lg" && "text-3xl leading-[1.1] sm:text-4xl",
						size === "xl" && "text-4xl leading-[1.05] tracking-[-0.035em] sm:text-5xl lg:text-6xl"
					)}
				>
					{title}
				</Heading>
				{lead && <p className="mt-3.5 max-w-2xl text-lg leading-[1.55] text-ink-muted">{lead}</p>}
			</div>
			{aside && <div className="shrink-0 lg:max-w-md">{aside}</div>}
		</div>
	);
}

export function Card({ className, as: Tag = "div", ...props }: { as?: "div" | "section" | "article" | "aside" } & ComponentProps<"div">) {
	return <Tag className={cn("rounded-card border border-line bg-white", className)} {...props} />;
}

/** A raised white panel on a tinted ground (auth forms, dialogs). */
export function Panel({ className, ...props }: ComponentProps<"div">) {
	return <div className={cn("rounded-panel bg-white shadow-[inset_0_0_0_1px_var(--color-line),var(--shadow-raised)]", className)} {...props} />;
}

/** A calm note on pale teal, e.g. "Changes after publication are recorded". */
export function Note({ children, tone = "teal", icon, className }: { children: ReactNode; tone?: "teal" | "peach" | "mist"; icon?: ReactNode; className?: string }) {
	return (
		<p
			className={cn(
				"flex items-start gap-2.5 rounded-input px-4 py-3.5 text-[15.5px] leading-normal text-ink",
				tone === "teal" && "bg-teal-50",
				tone === "peach" && "bg-peach-100",
				tone === "mist" && "bg-mist",
				className
			)}
		>
			{icon ?? <Info size={18} strokeWidth={2.2} className="mt-0.5 shrink-0 text-teal-500" aria-hidden="true" />}
			<span>{children}</span>
		</p>
	);
}

/** A recorded change: old value struck on peach, new value on pale teal. */
export function Diff({ removed, added }: { removed?: ReactNode; added?: ReactNode }) {
	return (
		<span>
			{removed !== undefined && <del className="rounded-sm bg-peach-100 px-1.5 py-px text-ink">{removed}</del>}{" "}
			{added !== undefined && (
				<ins className="rounded-sm bg-teal-50 px-1.5 py-px font-bold text-ink no-underline shadow-[inset_0_-2px_0_var(--color-teal-300)]">{added}</ins>
			)}
		</span>
	);
}

/** An arrow text link ("More about our goals →"). */
export function ArrowLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
	return (
		<a href={href} className={cn("inline-flex min-h-11 items-center gap-2 font-display text-base font-extrabold", className)}>
			{children}
			<ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
		</a>
	);
}

/** Initials on teal 200, used for people in the header, messages and admin lists. */
export function Avatar({ initials, size = 40, tone = "teal" }: { initials: string; size?: number; tone?: "teal" | "slate" }) {
	return (
		<span
			aria-hidden="true"
			style={{ width: size, height: size, fontSize: Math.round(size * 0.375) }}
			className={cn(
				"inline-flex shrink-0 items-center justify-center rounded-full font-display font-extrabold",
				tone === "teal" ? "bg-teal-200 text-ink" : "bg-ink text-white"
			)}
		>
			{initials}
		</span>
	);
}

export function EmptyState({ title, children, action }: { title: ReactNode; children?: ReactNode; action?: ReactNode }) {
	return (
		<div className="rounded-card border border-dashed border-line-strong bg-mist px-6 py-12 text-center">
			<h3 className="text-xl font-extrabold tracking-[-0.015em]">{title}</h3>
			{children && <p className="mx-auto mt-2 max-w-md text-ink-muted">{children}</p>}
			{action && <div className="mt-6 flex justify-center">{action}</div>}
		</div>
	);
}

/** A definition list in two columns, as on protocol cards and the registration record. */
export function DetailList({ items, termWidth = 64, className }: { items: { term: ReactNode; value: ReactNode }[]; termWidth?: number; className?: string }) {
	return (
		<dl className={cn("grid gap-x-3 gap-y-1.5 text-sm leading-[22px]", className)} style={{ gridTemplateColumns: `${termWidth}px minmax(0, 1fr)` }}>
			{items.map((item, index) => (
				<div key={index} className="contents">
					<dt className="text-ink-muted">{item.term}</dt>
					<dd className="min-w-0 font-semibold">{item.value}</dd>
				</div>
			))}
		</dl>
	);
}
