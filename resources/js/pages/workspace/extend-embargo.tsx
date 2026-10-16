import { useForm } from "@inertiajs/react";
import { ChevronRight, Clock, Lock } from "lucide-react";
import type { FormEvent } from "react";
import { Button, ButtonAnchor } from "@/components/ui/Button";
import { Note } from "@/components/ui/Content";
import { Field, FieldError, Textarea } from "@/components/ui/Form";
import { WorkspaceLayout } from "@/layouts/Layouts";
import { formatDate } from "@/lib/dates";
import { routes } from "@/lib/routes";

type Props = {
	protocol: { id: number; pct_id: string; title: string; ends: string; days_left: number; extensions: number };
	pending: { at: string; reason: string } | null;
};

export default function ExtendEmbargo({ protocol, pending }: Props) {
	const form = useForm({ confirm: false, reason: "" });
	const submit = (event: FormEvent) => {
		event.preventDefault();
		form.post(`/dashboard/extend-embargo/${protocol.id}`);
	};
	const days = Math.max(0, protocol.days_left);

	return (
		<WorkspaceLayout title="Extend embargo" tint={false} slimFooter>
			<section aria-labelledby="embargo-title" className="bg-teal-50">
				<div className="container-page pt-8 pb-10">
					<nav aria-label="Breadcrumb">
						<ol className="flex flex-wrap items-center gap-2 text-[14.5px]">
							<li>
								<a href={routes.myProtocols} className="text-link underline underline-offset-3">
									My protocols
								</a>
							</li>
							<li aria-hidden="true">
								<ChevronRight size={14} strokeWidth={2.4} />
							</li>
							<li aria-current="page" className="font-semibold">
								Extend embargo
							</li>
						</ol>
					</nav>
					<h1 id="embargo-title" className="mt-4 text-4xl leading-[1.08] font-extrabold tracking-[-0.035em] sm:text-[44px]">
						Extend the embargo
					</h1>
					<p className="mt-3 max-w-[720px] text-lg leading-[1.55]">Ask the PCT team for one more year before the details of your protocol become public.</p>
				</div>
			</section>

			<div className="container-page grid gap-8 pt-10 pb-16 lg:grid-cols-[minmax(0,1fr)_340px] lg:pb-20">
				<div className="grid content-start gap-6">
					<section aria-label="Protocol" className="rounded-card border border-line bg-white px-6 py-6 sm:px-8">
						<p className="pct-id text-[15px]">{protocol.pct_id}</p>
						<p className="mt-1 text-xl leading-snug font-bold">{protocol.title}</p>
						<p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-[15px] text-ink-muted">
							<span className="inline-flex items-center gap-1.5">
								<Lock size={15} strokeWidth={2.2} aria-hidden="true" />
								Embargo until <strong className="text-ink">{formatDate(protocol.ends)}</strong>
							</span>
							<span>
								{days} day{days === 1 ? "" : "s"} left
							</span>
							{protocol.extensions > 0 && (
								<span>
									Extended {protocol.extensions} time{protocol.extensions === 1 ? "" : "s"} before
								</span>
							)}
						</p>
					</section>

					{pending ? (
						<section aria-labelledby="pending-title" className="rounded-card bg-blue-100/60 px-6 py-6 sm:px-8">
							<h2 id="pending-title" className="flex items-center gap-2.5 text-xl font-extrabold">
								<Clock size={20} strokeWidth={2.2} aria-hidden="true" />
								Your request is with the PCT team
							</h2>
							<p className="mt-2 text-ink-muted">Sent on {formatDate(pending.at)}. You receive an email as soon as it is decided.</p>
							<p className="mt-4 rounded-input bg-white px-4 py-3 whitespace-pre-line">{pending.reason}</p>
							<ButtonAnchor href={routes.myProtocols} variant="secondary" className="mt-5">
								Back to My protocols
							</ButtonAnchor>
						</section>
					) : (
						<form onSubmit={submit} noValidate className="grid gap-6 rounded-card border border-line bg-white px-6 py-7 sm:px-8">
							<div>
								<label className="flex cursor-pointer items-start gap-3 text-base">
									<input type="checkbox" checked={form.data.confirm} onChange={event => form.setData("confirm", event.target.checked)} className="mt-0.5 size-5 shrink-0 accent-ink" aria-invalid={!!form.errors.confirm} />
									<span>
										I ask to extend the embargo of this protocol by one more year{" "}
										<span aria-hidden="true" className="text-rust">
											*
										</span>
									</span>
								</label>
								{form.errors.confirm && <FieldError className="mt-2">Tick the statement to send the request.</FieldError>}
							</div>
							<Field label="Why do you need more time?" required help="An administrator reviews the request, so tell them why the details should stay private for longer." error={form.errors.reason}>
								{({ id, describedBy, invalid }) => <Textarea id={id} rows={6} value={form.data.reason} onChange={event => form.setData("reason", event.target.value)} aria-describedby={describedBy} aria-invalid={invalid} />}
							</Field>
							{protocol.extensions >= 2 && (
								<Note tone="peach">We want the register to be as transparent as possible. A fourth year of embargo is only approved in specific cases, so motivate the request well.</Note>
							)}
							<div className="flex flex-wrap gap-3">
								<Button type="submit" arrow disabled={form.processing}>
									Send the request
								</Button>
								<ButtonAnchor href={routes.myProtocols} variant="ghost">
									Cancel
								</ButtonAnchor>
							</div>
						</form>
					)}
				</div>

				<aside aria-labelledby="how-title" className="self-start rounded-card bg-mist px-6 py-6">
					<h2 id="how-title" className="eyebrow">
						How it works
					</h2>
					<ol className="mt-4 grid gap-4">
						{[
							["The PCT team reviews your request", "Approval may take a few days."],
							["You get an email with the decision", "If it is approved, the embargo runs one year longer."],
							["Reminders start again", "1 month and 2 weeks before the new end date."]
						].map(([title, text], index) => (
							<li key={title} className="flex gap-3.5">
								<span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white font-display text-sm font-extrabold shadow-[inset_0_0_0_2px_var(--color-teal-300)]">
									{index + 1}
								</span>
								<span>
									<span className="block font-bold">{title}</span>
									<span className="block text-[14.5px] text-ink-muted">{text}</span>
								</span>
							</li>
						))}
					</ol>
				</aside>
			</div>
		</WorkspaceLayout>
	);
}
