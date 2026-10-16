import { Link } from "@inertiajs/react";
import { ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/* -------------------------------------------------------------------------- */
/* Tabs                                                                        */
/* -------------------------------------------------------------------------- */

export type TabItem = { key: string; label: ReactNode; count?: ReactNode };

/**
 * Underlined tabs: the active one is slate with a peach underline. Scrolls sideways
 * on narrow screens instead of wrapping.
 */
export function Tabs({ items, active, onChange, label, className }: { items: TabItem[]; active: string; onChange: (key: string) => void; label: string; className?: string }) {
	return (
		<div role="tablist" aria-label={label} className={cn("-mx-1 flex gap-7 overflow-x-auto px-1 [scrollbar-width:none]", className)}>
			{items.map(item => {
				const selected = item.key === active;
				return (
					<button
						key={item.key}
						role="tab"
						type="button"
						aria-selected={selected}
						onClick={() => onChange(item.key)}
						className={cn(
							"inline-flex h-12 shrink-0 items-center gap-2.5 px-1 text-[16.5px] whitespace-nowrap",
							selected ? "font-bold text-ink shadow-[inset_0_-3px_0_var(--color-peach-300)]" : "font-semibold text-ink-muted hover:text-ink hover:shadow-[inset_0_-3px_0_var(--color-line)]"
						)}
					>
						{item.label}
						{item.count}
					</button>
				);
			})}
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/* Dialog                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * A modal dialog on the native <dialog> element: focus is trapped, Escape closes it and
 * the page behind is inert.
 */
export function Dialog({ open, onClose, title, description, children, footer, size = "md" }: { open: boolean; onClose: () => void; title: ReactNode; description?: ReactNode; children?: ReactNode; footer?: ReactNode; size?: "sm" | "md" | "lg" }) {
	const ref = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog = ref.current;
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	}, [open]);

	return (
		<dialog
			ref={ref}
			onClose={onClose}
			onClick={event => event.target === ref.current && onClose()}
			className={cn(
				"m-auto w-[calc(100%-32px)] rounded-panel bg-white p-0 text-ink shadow-raised backdrop:bg-ink/40",
				size === "sm" && "max-w-md",
				size === "md" && "max-w-xl",
				size === "lg" && "max-w-3xl"
			)}
		>
			<div className="p-6 sm:p-8">
				<div className="flex items-start justify-between gap-4">
					<div>
						<h2 className="text-2xl font-extrabold tracking-[-0.02em]">{title}</h2>
						{description && <p className="mt-2 text-ink-muted">{description}</p>}
					</div>
					<button type="button" onClick={onClose} className="-mt-1 -mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-teal-50" aria-label="Close">
						<X size={20} strokeWidth={2.2} aria-hidden="true" />
					</button>
				</div>
				{children && <div className="mt-6">{children}</div>}
				{footer && <div className="mt-8 flex flex-wrap justify-end gap-3">{footer}</div>}
			</div>
		</dialog>
	);
}

/* -------------------------------------------------------------------------- */
/* Menu                                                                        */
/* -------------------------------------------------------------------------- */

export type MenuItem = { label: ReactNode; onSelect?: () => void; href?: string; disabled?: boolean };

/**
 * A "More" button with a list of actions that opens above or below it. Escape and a click
 * outside close it; focus returns to the button.
 */
export function Menu({
	label = "More",
	items,
	footer,
	align = "right",
	direction = "up",
	chevron = true,
	className
}: {
	label?: ReactNode;
	items: MenuItem[];
	footer?: ReactNode;
	align?: "left" | "right";
	/** Up for menus at the bottom of a card, down for menus in a page header. */
	direction?: "up" | "down";
	chevron?: boolean;
	className?: string;
}) {
	const [open, setOpen] = useState(false);
	const id = useId();
	const root = useRef<HTMLDivElement>(null);
	const button = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (!open) return;
		const onPointer = (event: PointerEvent) => root.current && !root.current.contains(event.target as Node) && setOpen(false);
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setOpen(false);
				button.current?.focus();
			}
		};
		document.addEventListener("pointerdown", onPointer);
		document.addEventListener("keydown", onKey);
		root.current?.querySelector<HTMLElement>("[data-menu-item]")?.focus();
		return () => {
			document.removeEventListener("pointerdown", onPointer);
			document.removeEventListener("keydown", onKey);
		};
	}, [open]);

	const itemClass = "flex min-h-11 w-full items-center rounded-md px-3 text-left text-[15.5px] font-bold text-ink hover:bg-teal-50 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50";

	return (
		<div ref={root} className={cn("relative", className)}>
			<button
				ref={button}
				type="button"
				aria-expanded={open}
				aria-controls={id}
				onClick={() => setOpen(!open)}
				className={cn(
					"inline-flex h-11 items-center gap-2 rounded-full px-4.5 font-display text-[15px] font-extrabold",
					open ? "bg-teal-50 shadow-[inset_0_0_0_1.5px_var(--color-teal-500)]" : "shadow-[inset_0_0_0_1.5px_var(--color-line)] hover:bg-teal-50"
				)}
			>
				{label}
				{chevron && <ChevronDown size={16} strokeWidth={2.4} aria-hidden="true" className={cn("transition-transform", open && "rotate-180")} />}
			</button>
			{open && (
				<div id={id} className={cn("absolute z-30 w-[272px] rounded-card bg-white p-2 shadow-[inset_0_0_0_1px_var(--color-line),var(--shadow-raised)]", direction === "up" ? "bottom-full mb-2" : "top-full mt-2", align === "right" ? "right-0" : "left-0")}>
					<ul>
						{items.map((item, index) => (
							<li key={index}>
								{item.href ? (
									<a data-menu-item href={item.href} className={itemClass} onClick={() => setOpen(false)}>
										{item.label}
									</a>
								) : (
									<button
										data-menu-item
										type="button"
										disabled={item.disabled}
										className={itemClass}
										onClick={() => {
											setOpen(false);
											item.onSelect?.();
										}}
									>
										{item.label}
									</button>
								)}
							</li>
						))}
					</ul>
					{footer && <p className="mt-1 border-t border-line px-3 pt-3 pb-2 text-[13.5px] leading-snug text-ink-muted">{footer}</p>}
				</div>
			)}
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/* Pagination                                                                  */
/* -------------------------------------------------------------------------- */

export type PaginationLink = { url: string | null; label: string; active: boolean };

/** Renders Laravel paginator links ("« Previous", 1, 2, …, "Next »"). */
export function Pagination({ links, summary, className }: { links: PaginationLink[]; summary?: ReactNode; className?: string }) {
	if (links.length <= 3) {
		return summary ? <p className={cn("text-sm text-ink-muted", className)}>{summary}</p> : null;
	}
	const [previous, ...rest] = links;
	const next = rest.pop()!;

	return (
		<nav aria-label="Pagination" className={cn("flex flex-col items-center gap-4 sm:flex-row sm:justify-between", className)}>
			{summary && <p className="text-sm text-ink-muted">{summary}</p>}
			<ul className="flex items-center gap-1">
				<li>
					<PageLink link={previous} label="Previous page">
						<ChevronLeft size={18} strokeWidth={2.4} aria-hidden="true" />
					</PageLink>
				</li>
				{rest.map((link, index) => (
					<li key={index} className={cn(!link.active && Number.isFinite(Number(link.label)) && "max-sm:hidden")}>
						<PageLink link={link}>{link.label}</PageLink>
					</li>
				))}
				<li>
					<PageLink link={next} label="Next page">
						<ChevronRight size={18} strokeWidth={2.4} aria-hidden="true" />
					</PageLink>
				</li>
			</ul>
		</nav>
	);
}

function PageLink({ link, label, children }: { link: PaginationLink; label?: string; children: ReactNode }) {
	const classes = cn(
		"inline-flex size-11 items-center justify-center rounded-full font-display text-[15px] font-bold tabular-nums",
		link.active ? "bg-ink text-white" : "text-ink hover:bg-teal-50 hover:text-ink"
	);
	if (!link.url || link.active) {
		return (
			<span aria-current={link.active ? "page" : undefined} aria-label={label} className={cn(classes, !link.url && !link.active && "text-line-strong hover:bg-transparent")}>
				{children}
			</span>
		);
	}
	return (
		<Link href={link.url} preserveScroll aria-label={label} className={classes}>
			{children}
		</Link>
	);
}

/* -------------------------------------------------------------------------- */
/* Responsive table                                                            */
/* -------------------------------------------------------------------------- */

export type Column<Row> = {
	key: string;
	header: ReactNode;
	cell: (row: Row) => ReactNode;
	/** The column that becomes the card title on phones. */
	primary?: boolean;
	className?: string;
};

/** A table on wide screens; below 768px each row becomes a card with label/value rows. */
export function DataTable<Row>({ columns, rows, rowKey, caption, empty }: { columns: Column<Row>[]; rows: Row[]; rowKey: (row: Row) => string | number; caption: string; empty?: ReactNode }) {
	if (!rows.length && empty) {
		return <>{empty}</>;
	}
	const primary = columns.find(column => column.primary) ?? columns[0];

	return (
		<>
			<table className="hidden w-full border-separate border-spacing-0 text-left md:table">
				<caption className="sr-only">{caption}</caption>
				<thead>
					<tr>
						{columns.map(column => (
							<th key={column.key} scope="col" className={cn("border-b border-line px-4 py-3 text-sm font-semibold text-ink-muted first:pl-0", column.className)}>
								{column.header}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map(row => (
						<tr key={rowKey(row)} className="hover:bg-mist">
							{columns.map(column => (
								<td key={column.key} className={cn("border-b border-teal-50 px-4 py-4 align-top first:pl-0", column.className)}>
									{column.cell(row)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
			<ul className="grid gap-3 md:hidden" aria-label={caption}>
				{rows.map(row => (
					<li key={rowKey(row)} className="rounded-card border border-line bg-white p-5">
						<div className="font-bold">{primary.cell(row)}</div>
						<dl className="mt-3 grid grid-cols-[minmax(96px,auto)_1fr] gap-x-3 gap-y-2 text-sm">
							{columns
								.filter(column => column !== primary)
								.map(column => (
									<div key={column.key} className="contents">
										<dt className="text-ink-muted">{column.header}</dt>
										<dd className="min-w-0">{column.cell(row)}</dd>
									</div>
								))}
						</dl>
					</li>
				))}
			</ul>
		</>
	);
}

/* -------------------------------------------------------------------------- */
/* Flash message                                                               */
/* -------------------------------------------------------------------------- */

export function FlashMessage({ tone, children, onDismiss }: { tone: "success" | "error"; children: ReactNode; onDismiss?: () => void }) {
	return (
		<div role={tone === "error" ? "alert" : "status"} className={cn("flex items-start gap-3 rounded-input px-4 py-3.5 text-[15.5px] font-semibold text-ink", tone === "success" ? "bg-teal-50" : "bg-peach-100")}>
			<span className="flex-1">{children}</span>
			{onDismiss && (
				<button type="button" onClick={onDismiss} aria-label="Dismiss" className="-my-1 -mr-1 inline-flex size-8 items-center justify-center rounded-full hover:bg-white/60">
					<X size={16} strokeWidth={2.4} aria-hidden="true" />
				</button>
			)}
		</div>
	);
}
