import { Link } from "@inertiajs/react";
import { Badge } from "@/components/ui/Badge";
import { centreLine, type PublicProtocol } from "@/types/register";

const activeStatuses = ["Active"];

function Status({ label }: { label: string | null }) {
	if (!label) return <span className="text-ink-subtle">–</span>;
	return (
		<Badge tone="neutral" size="sm" dot={activeStatuses.includes(label) ? "peach" : "grey"} className="h-auto! min-h-6.5 rounded-[13px]! py-1 leading-tight font-semibold whitespace-normal! [&>span:first-child]:shrink-0">
			{label}
		</Badge>
	);
}

/**
 * The database results as a list: PCT ID, title, study status, centres and dates (the same
 * facts the cards show). A table from 1280px, where the results column is wide enough for
 * five columns next to the filters; below that, each protocol is a compact row.
 */
export function ProtocolTable({ protocols, caption }: { protocols: PublicProtocol[]; caption: string }) {
	const href = (protocol: PublicProtocol) => `/database/view-protocol/${protocol.id}`;

	return (
		<>
			<div className="hidden overflow-x-auto rounded-card border border-line bg-white xl:block">
				<table className="w-full min-w-[760px] table-fixed border-collapse text-left text-[15px]">
					<caption className="sr-only">{caption}</caption>
					<colgroup>
						<col className="w-[128px]" />
						<col />
						<col className="w-[140px]" />
						<col className="w-[22%]" />
						<col className="w-[176px]" />
					</colgroup>
					<thead className="bg-mist">
						<tr>
							<th scope="col" className="px-4 py-3 text-sm font-bold whitespace-nowrap text-ink-muted">
								PCT ID
							</th>
							<th scope="col" className="px-4 py-3 text-sm font-bold text-ink-muted">
								Title
							</th>
							<th scope="col" className="px-4 py-3 text-sm font-bold whitespace-nowrap text-ink-muted">
								Study status
							</th>
							<th scope="col" className="px-4 py-3 text-sm font-bold text-ink-muted">
								Centre
							</th>
							<th scope="col" className="px-4 py-3 text-sm font-bold text-ink-muted">
								Dates
							</th>
						</tr>
					</thead>
					<tbody>
						{protocols.map(protocol => (
							<tr key={protocol.id} className="border-t border-line align-top hover:bg-teal-50/60">
								<td className="px-4 py-4">
									<span className="pct-id text-[13.5px] whitespace-nowrap">{protocol.pct_id}</span>
								</td>
								<th scope="row" className="px-4 py-4 text-left leading-[1.35] font-bold break-words">
									<Link href={href(protocol)} className="text-ink underline-offset-3 hover:text-link hover:underline">
										{protocol.title}
									</Link>
								</th>
								<td className="px-4 py-4">
									<Status label={protocol.study_status_label} />
								</td>
								<td className="px-4 py-4 break-words text-ink-muted">{centreLine(protocol) ?? "–"}</td>
								<td className="px-4 py-4 text-[14px] text-ink-muted">
									<Dates protocol={protocol} />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-white xl:hidden" aria-label={caption}>
				{protocols.map(protocol => (
					<li key={protocol.id} className="px-4.5 py-4">
						<div className="flex flex-wrap items-center justify-between gap-2">
							<span className="pct-id text-[13.5px]">{protocol.pct_id}</span>
							<Status label={protocol.study_status_label} />
						</div>
						<Link href={href(protocol)} className="mt-2 block text-base leading-[1.35] font-bold text-ink underline-offset-3 hover:text-link hover:underline">
							{protocol.title}
						</Link>
						{centreLine(protocol) && <p className="mt-1.5 text-[15px] text-ink-muted">{centreLine(protocol)}</p>}
						<div className="mt-1.5 text-[14px] text-ink-muted">
							<Dates protocol={protocol} inline />
						</div>
					</li>
				))}
			</ul>
		</>
	);
}

function Dates({ protocol, inline = false }: { protocol: PublicProtocol; inline?: boolean }) {
	const parts = [
		protocol.period ? (
			<span key="study" className="whitespace-nowrap">
				Study <span className="text-ink tabular-nums">{protocol.period}</span>
			</span>
		) : null,
		protocol.registered_on ? (
			<span key="registered" className="whitespace-nowrap">
				Registered <span className="text-ink tabular-nums">{protocol.registered_on}</span>
			</span>
		) : null
	].filter(part => part !== null);
	if (!parts.length) return <span className="text-ink-subtle">–</span>;

	return inline ? (
		<span className="flex flex-wrap gap-x-3 gap-y-0.5">{parts}</span>
	) : (
		<span className="flex flex-col gap-1">{parts}</span>
	);
}
