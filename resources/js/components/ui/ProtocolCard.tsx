import { Link } from "@inertiajs/react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge } from "./Badge";
import { DetailList } from "./Content";

export type ProtocolSummary = {
	id: number;
	pctId: string;
	title: string;
	summary?: string | null;
	/** Study status in words, e.g. "Active" or "Completed, not published". */
	studyStatus?: string | null;
	centre?: string | null;
	period?: string | null;
	species?: string | null;
	field?: string | null;
	registeredOn?: string | null;
	registeredBeforeStart?: boolean;
	href: string;
};

const activeStatuses = ["Active"];

/** A protocol in a grid of results: PCT ID, title, summary, key facts and registration date. */
export function ProtocolCard({ protocol, className }: { protocol: ProtocolSummary; className?: string }) {
	return (
		<Link
			href={protocol.href}
			className={cn(
				"group flex min-w-0 flex-col rounded-card border border-line bg-white px-6.5 pt-6.5 pb-5 text-ink transition-[border-color,box-shadow] duration-150",
				"hover:border-teal-300 hover:text-ink hover:shadow-card-hover",
				className
			)}
		>
			<div className="flex h-7 items-center justify-between gap-2">
				<span className="pct-id text-[14px]">{protocol.pctId}</span>
				{protocol.studyStatus && (
					<Badge tone="neutral" dot={activeStatuses.includes(protocol.studyStatus) ? "peach" : "grey"} className="font-semibold">
						{protocol.studyStatus}
					</Badge>
				)}
			</div>
			<h3 className="mt-4 line-clamp-3 text-lg leading-[1.3] font-bold tracking-[-0.01em]">{protocol.title}</h3>
			{protocol.summary && <p className="mt-2.5 line-clamp-3 text-[15px] leading-normal text-ink-muted">{protocol.summary}</p>}
			<DetailList
				className="mt-auto border-t border-teal-50 pt-4"
				items={[
					protocol.centre ? { term: "Centre", value: protocol.centre } : null,
					protocol.period ? { term: "Study", value: <span className="tabular-nums">{protocol.period}</span> } : null,
					protocol.species ? { term: "Species", value: protocol.species } : null,
					protocol.field ? { term: "Field", value: protocol.field } : null
				].filter(item => item !== null)}
			/>
			{protocol.registeredOn && (
				<div className="mt-4 flex min-h-7 items-center gap-2.5 border-t border-teal-50 pt-3.5 text-sm text-ink-muted">
					<span>
						Registered <span className="font-bold text-ink tabular-nums">{protocol.registeredOn}</span>
					</span>
					{protocol.registeredBeforeStart && (
						<Badge tone="peach" size="sm">
							Before study start
						</Badge>
					)}
					<ArrowRight size={20} strokeWidth={2} aria-hidden="true" className="ml-auto text-ink transition-transform group-hover:translate-x-0.5" />
				</div>
			)}
		</Link>
	);
}
