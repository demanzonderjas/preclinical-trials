import { useForm } from "@inertiajs/react";
import { ChevronRight } from "lucide-react";
import type { FormEvent } from "react";
import { display } from "@/components/admin/FieldValue";
import { type Message, ResearcherMessages } from "@/components/admin/ResearcherMessages";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button, ButtonAnchor } from "@/components/ui/Button";
import { RadioCards, Textarea } from "@/components/ui/Form";
import { fieldByKey, formSteps, protocolFields } from "@/data/protocol-schema";
import { AdminLayout } from "@/layouts/Layouts";
import { formatDate } from "@/lib/dates";
import { routes } from "@/lib/routes";
import { fieldList } from "@/lib/workspace";

type Values = Record<string, unknown>;
type Status = "pending" | "returned" | "approved" | "withdrawn";

type Props = {
	amendment: { id: number; status: Status; reason: string | null; message: string | null; submitted_at: string | null; decided_at: string | null; decided_by: string | null; researcher: string | null };
	protocol: { id: number; pct_id: string; title: string; registered_at: string | null };
	published: Values;
	proposed: Values;
	changed: string[];
	earlier: { status: Status; submitted_at: string | null; decided_at: string | null; decided_by: string | null; reason: string | null; fields: string[] }[];
	messages: Message[];
};

const statusText: Record<Status, string> = {
	pending: "Waiting for review",
	returned: "Returned to the researcher",
	approved: "Published",
	withdrawn: "Withdrawn by the researcher"
};

const order = (key: string) => protocolFields.findIndex(field => field.key === key);

export default function Amendment({ amendment, protocol, published, proposed, changed, earlier, messages }: Props) {
	const fields = [...changed].sort((a, b) => order(a) - order(b));
	const stepOf = (key: string) => formSteps.find(step => step.step === fieldByKey[key]?.step);

	return (
		<AdminLayout title={`Amendment: ${protocol.title}`}>
			<section aria-labelledby="amendment-title" className="bg-teal-50">
				<div className="container-page pt-8 pb-10">
					<nav aria-label="Breadcrumb">
						<ol className="flex flex-wrap items-center gap-2 text-[14.5px]">
							<li>
								<a href={routes.admin.protocols} className="text-link underline underline-offset-3">
									Protocols
								</a>
							</li>
							<li aria-hidden="true">
								<ChevronRight size={14} strokeWidth={2.4} />
							</li>
							<li aria-current="page" className="font-semibold">
								Amendment
							</li>
						</ol>
					</nav>
					<div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
						<h1 id="amendment-title" className="max-w-[860px] text-4xl leading-[1.08] font-extrabold tracking-[-0.035em] sm:text-[40px]">
							{protocol.title}
						</h1>
						<ButtonAnchor href={routes.protocol(protocol.id)} variant="secondary" className="shrink-0 self-start">
							View published version
						</ButtonAnchor>
					</div>
					<p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px] text-ink-muted">
						<StatusBadge status="published" />
						<Badge tone="blue-outline">Amendment · {statusText[amendment.status].toLowerCase()}</Badge>
						<span className="pct-id text-ink">{protocol.pct_id}</span>
						{amendment.researcher && <span>{amendment.researcher}</span>}
						{amendment.submitted_at && <span>Sent {formatDate(amendment.submitted_at)}</span>}
					</p>
				</div>
			</section>

			<div className="container-page grid gap-8 pt-10 pb-16 lg:grid-cols-[minmax(0,1fr)_356px] lg:pb-20">
				<div className="min-w-0">
					<h2 className="text-3xl font-extrabold tracking-[-0.03em]">Proposed changes</h2>
					<p className="mt-2 max-w-[620px] text-[16px] leading-normal text-ink-muted">
						Readers see the published version until you approve. On approval the changed answers become a new version in the public history, with the reason below.
					</p>

					<div className="mt-6 rounded-card bg-mist px-6 py-5">
						<p className="eyebrow text-xs">Why the researcher amends the protocol</p>
						<p className="mt-2 whitespace-pre-line">{amendment.reason || <span className="text-ink-muted italic">No reason given</span>}</p>
					</div>

					{fields.length === 0 ? (
						<p className="mt-6 rounded-card border border-line bg-white px-6 py-5 text-ink-muted">The proposed answers no longer differ from the published version.</p>
					) : (
						<ul className="mt-6 grid gap-5">
							{fields.map(key => {
								const field = fieldByKey[key];
								const step = stepOf(key);
								return (
									<li key={key} className="rounded-card border border-line bg-white px-5 py-5 sm:px-7">
										<p className="eyebrow text-xs">{step ? `Step ${step.step} · ${step.title}` : "Other"}</p>
										<h3 className="mt-2 flex items-start gap-3 text-lg font-bold leading-snug">
											{field?.number && <span className="flex h-7 min-w-8 shrink-0 items-center justify-center rounded-full bg-mist px-2 font-display text-[13px] font-extrabold">{field.number}</span>}
											{field?.label ?? key}
										</h3>
										<dl className="mt-4 grid gap-4 md:grid-cols-2">
											<div className="min-w-0 rounded-input bg-mist px-4 py-3.5">
												<dt className="eyebrow text-xs">Published</dt>
												<dd className="mt-1.5 text-[15.5px] leading-relaxed whitespace-pre-line">{(field && display(field, published[key])) ?? <span className="text-ink-muted italic">Not provided</span>}</dd>
											</div>
											<div className="min-w-0 rounded-input bg-blue-100 px-4 py-3.5">
												<dt className="eyebrow text-xs">Amended</dt>
												<dd className="mt-1.5 text-[15.5px] leading-relaxed whitespace-pre-line">{(field && display(field, proposed[key])) ?? <span className="text-ink-muted italic">Not provided</span>}</dd>
											</div>
										</dl>
									</li>
								);
							})}
						</ul>
					)}
				</div>

				<aside className="grid content-start gap-5">
					{amendment.status === "pending" ? (
						<Decision amendment={amendment} count={fields.length} />
					) : (
						<section aria-labelledby="outcome-title" className="rounded-card border border-line bg-white px-5 py-6 sm:px-6">
							<h2 id="outcome-title" className="text-2xl font-extrabold tracking-[-0.02em]">
								{statusText[amendment.status]}
							</h2>
							{amendment.decided_at && (
								<p className="mt-2 text-[14.5px] text-ink-muted">
									{formatDate(amendment.decided_at)}
									{amendment.decided_by ? ` by ${amendment.decided_by}` : ""}
								</p>
							)}
							{amendment.status === "returned" && amendment.message && <p className="mt-3 rounded-input bg-mist px-4 py-3 text-[15px] whitespace-pre-line">{amendment.message}</p>}
						</section>
					)}
					<ResearcherMessages protocolId={protocol.id} messages={messages} />
					{earlier.length > 0 && (
						<section aria-labelledby="earlier-title" className="rounded-card border border-line bg-white px-5 py-6 sm:px-6">
							<h2 id="earlier-title" className="text-xl font-extrabold">
								Earlier amendments
							</h2>
							<ol className="mt-4 grid gap-4">
								{[...earlier].reverse().map((item, index) => (
									<li key={index}>
										<p className="font-bold">{statusText[item.status]}</p>
										<p className="text-[14px] text-ink-muted">
											{item.submitted_at && `Sent ${formatDate(item.submitted_at)}`}
											{item.decided_by ? ` · decided by ${item.decided_by}` : ""}
										</p>
										{item.fields.length > 0 && <p className="mt-1 text-[14px]">{fieldList(item.fields)}</p>}
									</li>
								))}
							</ol>
						</section>
					)}
				</aside>
			</div>
		</AdminLayout>
	);
}

function Decision({ amendment, count }: { amendment: Props["amendment"]; count: number }) {
	const form = useForm({ decision: "approve", message: "" });
	const returning = form.data.decision === "return";
	const submit = (event: FormEvent) => {
		event.preventDefault();
		form.post(`/admin/amendments/${amendment.id}/decision`, { preserveScroll: true });
	};

	return (
		<form onSubmit={submit} className="rounded-card border border-line bg-white px-5 py-6 sm:px-6">
			<h2 className="text-2xl font-extrabold tracking-[-0.02em]">Decision</h2>
			<RadioCards
				name="decision"
				label="Decision"
				columns={1}
				className="mt-4"
				value={form.data.decision}
				onChange={value => form.setData("decision", value)}
				options={[
					{ value: "approve", label: "Approve & publish", description: `Publishes ${count} changed answer${count === 1 ? "" : "s"} as a new version. The date of registration stays the same.` },
					{ value: "return", label: "Return with feedback", description: "The published version stays as it is. The researcher can change the amendment and send it again." }
				]}
			/>
			{returning && (
				<>
					<label htmlFor="amendment-message" className="mt-6 block font-bold">
						Message to the researcher
					</label>
					<p className="mt-1 text-[14px] text-ink-muted">Say what to change before the amendment can be published.</p>
					<Textarea id="amendment-message" rows={4} className="mt-2" value={form.data.message} onChange={event => form.setData("message", event.target.value)} aria-invalid={!!form.errors.message} />
					{form.errors.message && <p className="mt-2 text-[14.5px] font-semibold text-rust">{form.errors.message}</p>}
				</>
			)}
			<Button type="submit" size="lg" arrow className="mt-6 w-full" disabled={form.processing || (returning && !form.data.message.trim())}>
				{returning ? "Return amendment" : "Approve & publish"}
			</Button>
			<p className="mt-2.5 text-[13.5px] leading-snug text-ink-muted">{returning ? "The researcher gets an e-mail with your message." : "The researcher gets an e-mail that the amendment is published."}</p>
		</form>
	);
}
