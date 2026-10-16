import { ChevronDown, CircleAlert } from "lucide-react";
import { type ComponentProps, type ReactNode, useId } from "react";
import { cn } from "@/lib/cn";

const control =
	"w-full rounded-input border-[1.5px] border-ink-subtle bg-white px-4 font-sans text-md text-ink placeholder:text-ink-subtle " +
	"focus:border-link focus:shadow-[0_0_0_4px_var(--color-blue-100)] focus:outline-none " +
	"aria-invalid:border-rust disabled:bg-mist disabled:text-ink-muted";

type FieldProps = {
	label: ReactNode;
	required?: boolean;
	help?: ReactNode;
	error?: string | null;
	className?: string;
	/** Renders the control; receives the ids to wire label, help and error. */
	children: (ids: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
};

/**
 * Label, optional help text, the control and an error message, wired together with
 * ids so screen readers announce all of it.
 */
export function Field({ label, required, help, error, className, children }: FieldProps) {
	const id = useId();
	const helpId = help ? `${id}-help` : undefined;
	const errorId = error ? `${id}-error` : undefined;
	const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;

	return (
		<div className={className}>
			<label htmlFor={id} className="block text-base font-bold text-ink">
				{label}
				{required && (
					<span aria-hidden="true" className="text-rust">
						{" "}
						*
					</span>
				)}
			</label>
			{help && (
				<p id={helpId} className="mt-1 text-[15px] leading-[1.45] text-ink-muted">
					{help}
				</p>
			)}
			<div className="mt-2">{children({ id, describedBy, invalid: !!error })}</div>
			{error && (
				<FieldError id={errorId} className="mt-2">
					{error}
				</FieldError>
			)}
		</div>
	);
}

export function FieldError({ id, className, children }: { id?: string; className?: string; children: ReactNode }) {
	return (
		<p id={id} role="alert" className={cn("flex items-center gap-2 rounded-xl bg-peach-100 px-3.5 py-2.5 text-[15px] font-semibold text-ink", className)}>
			<CircleAlert size={16} strokeWidth={2.2} className="shrink-0 text-rust" aria-hidden="true" />
			{children}
		</p>
	);
}

export function TextInput({ className, ...props }: ComponentProps<"input">) {
	return <input className={cn(control, "h-13", className)} {...props} />;
}

export function Textarea({ className, rows = 4, ...props }: ComponentProps<"textarea">) {
	return <textarea rows={rows} className={cn(control, "min-h-28 py-3 leading-normal", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
	return (
		<div className="relative">
			<select className={cn(control, "h-13 appearance-none pr-11", className)} {...props}>
				{children}
			</select>
			<ChevronDown size={16} strokeWidth={2.4} aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-ink" />
		</div>
	);
}

export function Checkbox({ label, className, ...props }: { label: ReactNode } & Omit<ComponentProps<"input">, "type">) {
	return (
		<label className={cn("flex min-h-11 cursor-pointer items-center gap-3 text-base text-ink", className)}>
			<input type="checkbox" className="size-5 shrink-0 accent-ink" {...props} />
			<span>{label}</span>
		</label>
	);
}

type RadioOption = { value: string; label: ReactNode; description?: ReactNode };

/** Radio buttons as cards; the chosen card gets a teal ring on pale teal. */
export function RadioCards({
	name,
	options,
	value,
	onChange,
	columns = 2,
	label,
	className
}: {
	name: string;
	options: RadioOption[];
	value: string | null;
	onChange: (value: string) => void;
	columns?: 1 | 2 | 3;
	label: string;
	className?: string;
}) {
	return (
		<div
			role="radiogroup"
			aria-label={label}
			className={cn("grid gap-3", columns === 2 && "sm:grid-cols-2", columns === 3 && "sm:grid-cols-3", className)}
		>
			{options.map(option => {
				const checked = option.value === value;
				return (
					<label
						key={option.value}
						className={cn(
							"flex cursor-pointer items-start gap-3 rounded-2xl px-4.5 py-4",
							checked ? "bg-teal-50 shadow-[inset_0_0_0_2px_var(--color-teal-500)]" : "bg-white shadow-[inset_0_0_0_1.5px_var(--color-line-strong)] hover:bg-mist"
						)}
					>
						<input
							type="radio"
							name={name}
							value={option.value}
							checked={checked}
							onChange={() => onChange(option.value)}
							className="mt-0.5 size-5 shrink-0 accent-ink"
						/>
						<span>
							<span className="block text-base font-bold">{option.label}</span>
							{option.description && <span className="mt-0.5 block text-[15px] text-ink-muted">{option.description}</span>}
						</span>
					</label>
				);
			})}
		</div>
	);
}

/** An on/off switch with its visible label. */
export function Switch({
	checked,
	onChange,
	label,
	description,
	disabled
}: {
	checked: boolean;
	onChange: (checked: boolean) => void;
	label: ReactNode;
	description?: ReactNode;
	disabled?: boolean;
}) {
	const id = useId();
	return (
		<div className="flex items-start gap-3">
			<button
				id={id}
				type="button"
				role="switch"
				aria-checked={checked}
				disabled={disabled}
				onClick={() => onChange(!checked)}
				className={cn(
					"relative mt-0.5 h-7.5 w-13 shrink-0 rounded-full transition-colors disabled:opacity-55",
					checked ? "bg-teal-500" : "bg-line-strong"
				)}
			>
				<span className={cn("absolute top-1 size-5.5 rounded-full bg-white transition-[left]", checked ? "left-6.5" : "left-1")} />
				<span className="sr-only">{label}</span>
			</button>
			<label htmlFor={id} className="cursor-pointer text-base">
				<span className="block">{label}</span>
				{description && <span className="mt-0.5 block text-[15px] text-ink-muted">{description}</span>}
			</label>
		</div>
	);
}
