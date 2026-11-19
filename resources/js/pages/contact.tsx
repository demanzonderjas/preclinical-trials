import { useForm } from "@inertiajs/react";
import { ArrowRight, ChevronRight, Copy, Check, Search } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ArrowLink } from "@/components/ui/Content";
import { Field, Select, TextInput, Textarea } from "@/components/ui/Form";
import { RichContent, TextLines } from "@/components/ui/RichContent";
import { PublicLayout } from "@/layouts/Layouts";
import { fill } from "@/lib/content";
import { routes } from "@/lib/routes";
import type { ContactContent } from "@/types/page-content";

type Props = {
	/** The texts, edited in Admin → Content → Pages (app/Content/Pages/ContactPage.php). */
	content: ContactContent;
	topics: { value: string; label: string }[];
	faqCount: number;
	prefill: { topic: string | null; pct_id: string | null; email: string | null; name: string | null };
};

export default function Contact({ content, topics, faqCount, prefill }: Props) {
	const { intro, helpdesk, frequent, form: formText, details, team, messages } = content;
	const form = useForm({
		name: prefill.name ?? "",
		email: prefill.email ?? "",
		topic: prefill.topic ?? "",
		pct_id: prefill.pct_id ?? "",
		message: ""
	});
	const [copied, setCopied] = useState(false);

	const submit = (event: FormEvent) => {
		event.preventDefault();
		form.post("/contact", { preserveScroll: true, onSuccess: () => form.reset("message") });
	};

	const copyAddress = async () => {
		await navigator.clipboard?.writeText(details.email);
		setCopied(true);
		window.setTimeout(() => setCopied(false), 2000);
	};

	return (
		<PublicLayout title="Contact" description={intro.text}>
			<section aria-labelledby="contact-title" className="relative overflow-hidden bg-teal-50 pb-40">
				<svg aria-hidden="true" className="pointer-events-none absolute -top-56 -right-40 hidden h-[600px] w-[600px] lg:block" viewBox="0 0 600 600" fill="none">
					<circle cx="300" cy="300" r="290" stroke="#83B2BA" strokeWidth="2" />
					<circle cx="300" cy="300" r="220" stroke="#FFA888" strokeWidth="2" strokeDasharray="4 10" />
				</svg>
				<div className="container-page relative pt-10 lg:pt-14">
					<nav aria-label="Breadcrumb">
						<ol className="flex items-center gap-2 text-[15px]">
							<li>
								<a href={routes.home} className="underline underline-offset-3">
									Home
								</a>
							</li>
							<li aria-hidden="true">
								<ChevronRight size={14} strokeWidth={2.4} className="text-ink-muted" />
							</li>
							<li aria-current="page" className="font-semibold">
								Contact
							</li>
						</ol>
					</nav>
					<h1 id="contact-title" className="mt-6 text-4xl leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-5xl lg:text-[60px]">
						{intro.title}
					</h1>
					<p className="mt-4 max-w-[640px] text-lg leading-[1.55] sm:text-[19px]">{intro.text}</p>
				</div>
			</section>

			<div className="container-page relative -mt-32">
				<section aria-labelledby="helpdesk-title" className="grid overflow-hidden rounded-[28px] bg-white shadow-[inset_0_0_0_1px_var(--color-line),var(--shadow-raised)] lg:grid-cols-[minmax(0,1fr)_500px]">
					<div className="p-6 sm:p-9">
						<h2 id="helpdesk-title" className="text-xl font-extrabold tracking-[-0.02em] sm:text-2xl">
							{helpdesk.title}
						</h2>
						<p className="mt-2 text-[15px] text-ink-muted">{fill(helpdesk.count_text, { count: faqCount })}</p>
						<form action={routes.help} method="get" role="search" className="mt-6 flex items-center gap-2 rounded-full p-1.5 shadow-[inset_0_0_0_1.5px_var(--color-ink-subtle)] focus-within:shadow-[inset_0_0_0_1.5px_var(--color-link),0_0_0_4px_var(--color-blue-100)]">
							<Search size={18} strokeWidth={2.2} className="ml-3 shrink-0 text-teal-500" aria-hidden="true" />
							<label htmlFor="help-search" className="sr-only">
								Search the help centre
							</label>
							<input id="help-search" name="q" type="search" placeholder={helpdesk.search_placeholder} className="h-10 min-w-0 flex-1 bg-transparent outline-none placeholder:text-ink-subtle" />
							<Button type="submit" size="sm">
								Search
							</Button>
						</form>
					</div>
					<div className="border-t border-line bg-mist p-6 sm:p-9 lg:border-t-0 lg:border-l">
						<p className="eyebrow">{frequent.eyebrow}</p>
						<ul className="mt-4 grid gap-3.5">
							{frequent.questions.map(({ question }) =>
								question ? (
									<li key={question.id}>
										<a href={`${routes.help}#faq-${question.id}`} className="underline underline-offset-3">
											{question.title}
										</a>
									</li>
								) : null
							)}
						</ul>
						<a href={frequent.help_link.url} className="mt-5 inline-flex items-center gap-2 font-display font-bold text-ink hover:text-link">
							{frequent.help_link.label}
							<ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
						</a>
					</div>
				</section>

				<div className="mt-12 grid gap-8 pb-20 lg:grid-cols-[minmax(0,1fr)_488px] lg:pb-24">
					<section aria-labelledby="form-title" className="rounded-[28px] border border-line p-6 sm:p-11">
						<p className="eyebrow">{formText.eyebrow}</p>
						<h2 id="form-title" className="mt-3 text-3xl font-extrabold tracking-[-0.025em] sm:text-[34px]">
							{formText.title}
						</h2>
						<p className="mt-2.5 text-md leading-normal text-ink-muted">{formText.text}</p>

						<form onSubmit={submit} className="mt-8 grid gap-5" noValidate>
							<div className="grid gap-5 sm:grid-cols-2">
								<Field label="Name" required error={form.errors.name}>
									{({ id, describedBy, invalid }) => (
										<TextInput id={id} autoComplete="name" value={form.data.name} onChange={event => form.setData("name", event.target.value)} aria-describedby={describedBy} aria-invalid={invalid} required />
									)}
								</Field>
								<Field label="Email" required error={form.errors.email}>
									{({ id, describedBy, invalid }) => (
										<TextInput id={id} type="email" autoComplete="email" value={form.data.email} onChange={event => form.setData("email", event.target.value)} aria-describedby={describedBy} aria-invalid={invalid} required />
									)}
								</Field>
								<Field label="Topic" required error={form.errors.topic}>
									{({ id, describedBy, invalid }) => (
										<Select id={id} value={form.data.topic} onChange={event => form.setData("topic", event.target.value)} aria-describedby={describedBy} aria-invalid={invalid} required>
											<option value="" disabled>
												Choose a topic
											</option>
											{topics.map(topic => (
												<option key={topic.value} value={topic.value}>
													{topic.label}
												</option>
											))}
										</Select>
									)}
								</Field>
								<Field label={<>Related PCT ID <span className="font-normal text-ink-muted">(optional)</span></>} help="Helps us find your protocol straight away." helpBelow error={form.errors.pct_id}>
									{({ id, describedBy, invalid }) => (
										<TextInput id={id} value={form.data.pct_id} onChange={event => form.setData("pct_id", event.target.value)} placeholder="e.g. PCTE0000123" aria-describedby={describedBy} aria-invalid={invalid} className="pct-id placeholder:font-sans placeholder:font-normal placeholder:tracking-normal" />
									)}
								</Field>
							</div>
							<Field label="Message" required error={form.errors.message}>
								{({ id, describedBy, invalid }) => (
									<>
										<Textarea id={id} rows={7} maxLength={2000} value={form.data.message} onChange={event => form.setData("message", event.target.value)} aria-describedby={describedBy} aria-invalid={invalid} required />
										<p className="mt-1.5 flex justify-between gap-4 text-[14px] text-ink-muted">
											<span>Please don’t include confidential study data.</span>
											<span className="tabular-nums">{form.data.message.length} / 2000</span>
										</p>
									</>
								)}
							</Field>
							<div className="mt-2 flex flex-col gap-5 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
								<RichContent html={formText.privacy} className="max-w-sm text-[14.5px] text-ink-muted [&_a]:font-bold" />
								<Button type="submit" size="lg" arrow disabled={form.processing}>
									Send message
								</Button>
							</div>
						</form>
					</section>

					<aside className="grid content-start gap-5">
						<section aria-labelledby="details-title" className="rounded-[28px] bg-teal-50 p-6 sm:p-9">
							<p id="details-title" className="eyebrow">
								{details.eyebrow}
							</p>
							<p className="mt-5 text-[15px] font-bold">{details.email_label}</p>
							<a href={`mailto:${details.email}`} className="mt-1 inline-block font-display text-xl font-bold text-ink underline decoration-peach-300 decoration-2 underline-offset-6 hover:text-link sm:text-2xl">
								{details.email}
							</a>
							<div className="mt-3.5">
								<Button variant="secondary" size="sm" onClick={copyAddress} icon={copied ? <Check size={16} strokeWidth={2.6} aria-hidden="true" /> : <Copy size={16} strokeWidth={2.2} aria-hidden="true" />}>
									{copied ? "Copied" : "Copy address"}
								</Button>
							</div>
							<p className="mt-6 text-[15px] font-bold">{details.address_label}</p>
							<address className="mt-1 leading-relaxed not-italic">
								<TextLines text={details.address} />
							</address>
						</section>
						<section aria-labelledby="team-title" className="rounded-[28px] border border-line p-6 sm:p-7">
							<h2 id="team-title" className="text-lg font-bold">
								{team.title}
							</h2>
							<ul className="mt-4 grid gap-4">
								{team.people.map((person, index) => (
									<li key={index} className="flex items-center gap-4">
										<img src={person.photo.src} alt={person.photo.alt} className="size-12 rounded-full object-cover" loading="lazy" />
										<span>
											<span className="block font-bold">{person.name}</span>
											<span className="block text-[14.5px] text-ink-muted">{person.role}</span>
										</span>
									</li>
								))}
							</ul>
							<a href={team.appointment.url} className="mt-5 flex items-center justify-between gap-3 rounded-input bg-mist px-4 py-3 font-bold text-ink hover:text-link">
								{team.appointment.label}
								<ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
							</a>
						</section>
						<section aria-labelledby="messages-title" className="rounded-[28px] border border-line p-6 sm:p-7">
							<h2 id="messages-title" className="text-lg font-bold">
								{messages.title}
							</h2>
							<p className="mt-1.5 text-[15px] text-ink-muted">{messages.text}</p>
							<ArrowLink href={messages.link.url} className="mt-2">
								{messages.link.label}
							</ArrowLink>
						</section>
					</aside>
				</div>
			</div>
		</PublicLayout>
	);
}
