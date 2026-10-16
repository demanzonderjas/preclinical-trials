import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ProcessStep = {
	title: ReactNode;
	text: ReactNode;
	icon: ReactNode;
	/** The step that matters most is a filled peach ring. */
	highlight?: boolean;
};

/** Numbered steps on a line (horizontal on wide screens, a vertical list on phones). */
export function ProcessSteps({ steps, className }: { steps: ProcessStep[]; className?: string }) {
	return (
		<ol className={cn("grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 xl:gap-6", className)}>
			{steps.map((step, index) => (
				<li key={index} className="relative flex gap-5 sm:block">
					<span
						className={cn(
							"flex size-16 shrink-0 items-center justify-center rounded-full text-ink",
							step.highlight ? "bg-peach-300 shadow-[0_0_0_6px_var(--color-peach-100)]" : "border-2 border-teal-300 bg-white"
						)}
					>
						{step.icon}
					</span>
					<div>
						<p className="eyebrow text-[13px] tabular-nums sm:mt-5.5">Step {String(index + 1).padStart(2, "0")}</p>
						<h3 className="mt-2 text-lg leading-[1.28] font-bold tracking-[-0.01em]">{step.title}</h3>
						<p className="mt-2 text-[15.5px] leading-normal text-ink-muted">{step.text}</p>
					</div>
				</li>
			))}
		</ol>
	);
}
