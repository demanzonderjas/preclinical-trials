import { Link } from "@inertiajs/react";
import { ArrowRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "accent" | "ghost" | "link" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const base =
	"inline-flex items-center justify-center gap-2.5 rounded-full font-display font-extrabold whitespace-nowrap transition-[box-shadow,background-color,color] duration-150 disabled:cursor-not-allowed disabled:opacity-55";

const variants: Record<ButtonVariant, string> = {
	// Slate primary; a soft ring on hover instead of a colour change.
	primary: "bg-ink text-white hover:text-white hover:shadow-[0_0_0_5px_var(--color-line)]",
	// Outlined secondary.
	secondary: "bg-white text-ink shadow-[inset_0_0_0_1.5px_var(--color-line-strong)] hover:bg-teal-50 hover:text-ink",
	// The one peach call to action per page, at most.
	accent: "bg-peach-300 text-ink hover:text-ink hover:shadow-[0_0_0_5px_var(--color-peach-100)]",
	ghost: "bg-transparent text-ink hover:bg-teal-50 hover:text-ink",
	link: "h-auto px-0 text-link hover:text-link-hover hover:underline underline-offset-4",
	danger: "bg-white text-rust shadow-[inset_0_0_0_1.5px_var(--color-rust)] hover:bg-peach-100 hover:text-rust"
};

const sizes: Record<ButtonSize, string> = {
	sm: "h-11 px-5 text-[15px]",
	md: "h-13 px-6.5 text-base",
	lg: "h-14 px-7 text-[16.5px]"
};

type CommonProps = {
	variant?: ButtonVariant;
	size?: ButtonSize;
	/** Adds the arrow used on forward actions ("Register a protocol →"). */
	arrow?: boolean;
	icon?: ReactNode;
	className?: string;
	children: ReactNode;
};

export function buttonClasses({ variant = "primary", size = "md", className }: Pick<CommonProps, "variant" | "size" | "className">) {
	return cn(base, variants[variant], variant !== "link" && sizes[size], className);
}

function Content({ icon, arrow, children }: Pick<CommonProps, "icon" | "arrow" | "children">) {
	return (
		<>
			{icon}
			{children}
			{arrow && <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />}
		</>
	);
}

export function Button({ variant, size, arrow, icon, className, children, type = "button", ...rest }: CommonProps & Omit<ComponentProps<"button">, "children">) {
	return (
		<button type={type} className={buttonClasses({ variant, size, className })} {...rest}>
			<Content icon={icon} arrow={arrow}>
				{children}
			</Content>
		</button>
	);
}

/** A button-styled Inertia link (internal navigation). */
export function ButtonLink({ variant, size, arrow, icon, className, children, ...rest }: CommonProps & Omit<ComponentProps<typeof Link>, "children">) {
	return (
		<Link className={buttonClasses({ variant, size, className })} {...rest}>
			<Content icon={icon} arrow={arrow}>
				{children}
			</Content>
		</Link>
	);
}

/** A button-styled plain anchor, for downloads, full page loads and external links. */
export function ButtonAnchor({ variant, size, arrow, icon, className, children, ...rest }: CommonProps & Omit<ComponentProps<"a">, "children">) {
	return (
		<a className={buttonClasses({ variant, size, className })} {...rest}>
			<Content icon={icon} arrow={arrow}>
				{children}
			</Content>
		</a>
	);
}
