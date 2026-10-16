import { cn } from "@/lib/cn";
import type { RegisterFigures } from "@/types/register";

/**
 * Small, dependency-free charts for the register figures. Bars are drawn with CSS so they
 * render on the server and stay crisp; every value is also printed as text.
 */

export function RegistrationsPerYear({ perYear, className }: { perYear: RegisterFigures["per_year"]; className?: string }) {
	const max = Math.max(1, ...perYear.map(item => item.count));
	const record = perYear.reduce<{ year: number; count: number } | null>((best, item) => (!best || item.count > best.count ? item : best), null);
	const currentYear = new Date().getFullYear();

	return (
		<figure className={cn("min-w-0 rounded-[22px] bg-mist p-6 sm:p-7", className)}>
			<figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
				<span className="font-display text-lg font-bold">Public registrations per year</span>
				{record && (
					<span className="text-sm text-ink-muted">
						{record.year} was a record year · {currentYear} so far
					</span>
				)}
			</figcaption>
			<div className="-mx-1 mt-6 overflow-x-auto px-1 pb-1">
				<ol className="flex h-48 min-w-[480px] items-end gap-2 sm:gap-3">
					{perYear.map(item => {
						const isRecord = record?.year === item.year;
						const isCurrent = item.year === currentYear;
						return (
							<li key={item.year} className="flex h-full flex-1 flex-col items-center justify-end">
								<span className="mb-1.5 text-[13px] font-bold tabular-nums text-ink-muted">{item.count}</span>
								<span
									aria-hidden="true"
									style={{ height: `${Math.max(4, (item.count / max) * 100)}%` }}
									className={cn(
										"w-full rounded-t-md",
										isRecord ? "bg-blue-400" : "bg-blue-100",
										isCurrent && "border-2 border-dashed border-blue-400 bg-transparent"
									)}
								/>
								<span className="mt-2 text-[13px] tabular-nums text-ink-muted">{item.year}</span>
							</li>
						);
					})}
				</ol>
			</div>
		</figure>
	);
}

export function WhatGetsRegistered({ stages, species, className }: Pick<RegisterFigures, "stages" | "species"> & { className?: string }) {
	const totalStages = Math.max(1, stages.confirmatory + stages.exploratory);
	const confirmatoryShare = (stages.confirmatory / totalStages) * 100;
	const topSpecies = species.slice(0, 4);
	const maxSpecies = Math.max(1, ...topSpecies.map(item => item.count));

	return (
		<figure className={cn("min-w-0 rounded-[22px] bg-mist p-6 sm:p-7", className)}>
			<figcaption className="font-display text-lg font-bold">What gets registered</figcaption>
			<div className="mt-5 flex h-3 gap-1 overflow-hidden rounded-full" aria-hidden="true">
				<span className="rounded-full bg-teal-300" style={{ width: `${confirmatoryShare}%` }} />
				<span className="flex-1 rounded-full bg-teal-200" />
			</div>
			<p className="mt-2.5 flex justify-between text-sm text-ink-muted">
				<span>
					<strong className="font-bold text-ink tabular-nums">{stages.confirmatory}</strong> confirmatory
				</span>
				<span>
					<strong className="font-bold text-ink tabular-nums">{stages.exploratory}</strong> exploratory
				</span>
			</p>
			<p className="eyebrow mt-6 text-[12px]">Most registered species</p>
			<ul className="mt-3.5 grid gap-3">
				{topSpecies.map(item => (
					<li key={item.species} className="grid grid-cols-[64px_1fr_32px] items-center gap-3 text-[15px]">
						<span>{item.label}</span>
						<span className="h-2 overflow-hidden rounded-full bg-white" aria-hidden="true">
							<span className="block h-full rounded-full bg-teal-300" style={{ width: `${(item.count / maxSpecies) * 100}%` }} />
						</span>
						<span className="text-right font-bold tabular-nums">{item.count}</span>
					</li>
				))}
			</ul>
		</figure>
	);
}
