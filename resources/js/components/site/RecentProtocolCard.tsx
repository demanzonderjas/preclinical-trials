import { CalendarDays, Check, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { centreLine, type PublicProtocol } from "@/types/register";

const activeStatuses = ["active"];
const publishedStatuses = ["completed_and_published_full_text", "completed_and_published_abstract"];

/** The compact protocol card of the home page's "Fresh from the register". */
export function RecentProtocolCard({ protocol, href }: { protocol: PublicProtocol; href: string }) {
	const centre = centreLine(protocol);
	return (
		<a
			href={href}
			className="flex min-w-0 flex-col rounded-card border border-line bg-white px-6 pt-6 pb-6 text-ink transition-[border-color,box-shadow] hover:border-teal-300 hover:text-ink hover:shadow-card-hover"
		>
			<div className="flex items-baseline justify-between gap-2">
				<span className="pct-id text-[14px]">{protocol.pct_id}</span>
				{protocol.registered_on && <span className="text-[13.5px] text-ink-muted tabular-nums">{protocol.registered_on}</span>}
			</div>
			<h3 className="mt-3.5 line-clamp-3 text-lg leading-[1.3] font-bold tracking-[-0.01em]">{protocol.title}</h3>
			{protocol.summary && <p className="mt-2.5 line-clamp-3 text-[15px] leading-normal text-ink-muted">{protocol.summary}</p>}
			<div className="mt-4 flex flex-wrap gap-2">
				{protocol.study_status_label && (
					<Badge
						tone="neutral"
						size="sm"
						dot={activeStatuses.includes(protocol.study_status ?? "") ? "peach" : publishedStatuses.includes(protocol.study_status ?? "") ? "teal" : "grey"}
						className="font-semibold"
					>
						{protocol.study_status_label}
					</Badge>
				)}
				{protocol.species_label && (
					<Badge tone="teal" size="sm">
						{protocol.species_label}
					</Badge>
				)}
				{protocol.registered_before_start && (
					<Badge tone="peach" size="sm" icon={<Check size={12} strokeWidth={2.8} aria-hidden="true" />}>
						Registered before start
					</Badge>
				)}
			</div>
			<div className="min-h-5 flex-1" />
			<dl className="grid gap-2 border-t border-teal-50 pt-4 text-sm">
				{centre && (
					<div className="flex items-start gap-2.5">
						<dt className="mt-0.5 shrink-0 text-teal-500">
							<MapPin size={16} strokeWidth={2} aria-hidden="true" />
							<span className="sr-only">Study centre</span>
						</dt>
						<dd className="font-semibold">{centre}</dd>
					</div>
				)}
				{protocol.period && (
					<div className="flex items-start gap-2.5">
						<dt className="mt-0.5 shrink-0 text-teal-500">
							<CalendarDays size={16} strokeWidth={2} aria-hidden="true" />
							<span className="sr-only">Study period</span>
						</dt>
						<dd className="tabular-nums">{protocol.period}</dd>
					</div>
				)}
			</dl>
		</a>
	);
}
