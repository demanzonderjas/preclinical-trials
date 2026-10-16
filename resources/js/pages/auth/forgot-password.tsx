import { useForm } from "@inertiajs/react";
import { ArrowRight, ChevronLeft, MailCheck } from "lucide-react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Form";
import { AuthLayout } from "@/layouts/Layouts";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

type Props = { sentTo?: string | null; sentAt?: string | null };

const card = "flex flex-col rounded-[28px] bg-white px-6 py-8 shadow-[inset_0_0_0_1px_var(--color-line),var(--shadow-raised)] sm:px-11 sm:py-10";

function StepNumber({ number, active }: { number: number; active: boolean }) {
	return (
		<span className={cn("flex size-9 items-center justify-center rounded-full font-display text-base font-extrabold", active ? "bg-peach-300" : "bg-teal-50")}>
			{number}
		</span>
	);
}

export default function ForgotPassword({ sentTo, sentAt }: Props) {
	const form = useForm({ email: sentTo ?? "" });
	const sent = !!sentTo;

	const submit = (event: FormEvent) => {
		event.preventDefault();
		form.post("/forgot-password", { preserveScroll: true });
	};

	return (
		<AuthLayout title="Reset your password">
			<div className="container-page">
				<div className="mx-auto max-w-[720px] text-center">
					<a href={routes.login} className="inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-3">
						<ChevronLeft size={14} strokeWidth={2.4} aria-hidden="true" />
						Back to log in
					</a>
					<h1 className="mt-4 text-4xl leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-5xl">Reset your password</h1>
					<p className="mt-3.5 text-lg leading-[1.55] text-ink-muted sm:text-[19px]">Two quick steps and you are back to your protocols. Your drafts are safe.</p>
				</div>

				<div className="mx-auto mt-11 grid max-w-[1160px] items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_72px_minmax(0,1fr)] lg:gap-0">
					<section aria-labelledby="req-title" className={card}>
						<div className="flex items-center gap-3">
							<StepNumber number={1} active={!sent} />
							<p className="eyebrow">Request a link</p>
						</div>
						<h2 id="req-title" className="mt-5 text-2xl leading-[1.15] font-extrabold tracking-[-0.025em] sm:text-3xl">
							Which email do you log in with?
						</h2>
						<p className="mt-2.5 text-md text-ink-muted">We'll email you a link to choose a new password.</p>
						<form onSubmit={submit} className="mt-7 grid gap-5" noValidate>
							<Field label="Email address" help="Use the address you registered with, usually your institutional email." error={form.errors.email}>
								{({ id, describedBy, invalid }) => (
									<TextInput
										id={id}
										type="email"
										autoComplete="email"
										required
										value={form.data.email}
										onChange={event => form.setData("email", event.target.value)}
										aria-describedby={describedBy}
										aria-invalid={invalid}
										className="h-14"
									/>
								)}
							</Field>
							<Button type="submit" size="lg" arrow disabled={form.processing} className="w-full">
								{sent ? "Send another link" : "Send reset link"}
							</Button>
						</form>
						<p className="mt-auto pt-12 text-base text-ink-muted">
							No account yet?{" "}
							<a href={routes.createAccount} className="font-bold underline underline-offset-3">
								Create a free account
							</a>
						</p>
					</section>

					<div aria-hidden="true" className="relative hidden items-center justify-center lg:flex">
						<span className="absolute inset-x-0 top-1/2 border-t-2 border-teal-200" />
						<span className="relative flex size-10 items-center justify-center rounded-full bg-white shadow-[inset_0_0_0_2px_var(--color-teal-300)]">
							<ArrowRight size={18} strokeWidth={2.4} />
						</span>
					</div>

					<section aria-labelledby="inbox-title" className={cn(card, !sent && "opacity-60")}>
						<div className="flex items-center justify-between gap-3">
							<div className="flex items-center gap-3">
								<StepNumber number={2} active={sent} />
								<p className="eyebrow">Check your inbox</p>
							</div>
							{sent && sentAt && <span className="text-sm font-semibold text-ink-muted tabular-nums">Sent {sentAt}</span>}
						</div>
						<div role="status" aria-live="polite" className="mt-5.5 flex items-center gap-5.5">
							<span className="flex size-20 shrink-0 items-center justify-center rounded-[18px] bg-teal-50 max-sm:hidden">
								<MailCheck size={40} strokeWidth={1.6} aria-hidden="true" />
							</span>
							<div>
								<h2 id="inbox-title" className="text-2xl leading-[1.15] font-extrabold tracking-[-0.025em] sm:text-3xl">
									{sent ? "Link on its way" : "Then check your inbox"}
								</h2>
								<p className="mt-2 text-[16.5px] leading-normal">
									{sent ? (
										<>
											If an account exists for <strong>{sentTo}</strong>, you'll find a reset link there. It stays valid for three weeks.
										</>
									) : (
										"The email contains a link to choose a new password."
									)}
								</p>
							</div>
						</div>
						<ol className="mt-6.5 grid gap-2.5 rounded-2xl bg-mist px-5 py-4.5 text-base leading-[22px]">
							{["Open the email from PreclinicalTrials.eu", "Click “Choose a new password” and pick one", "Log in, and you are back on your dashboard"].map((step, index) => (
								<li key={step} className="flex items-start gap-3">
									<span className="w-5.5 shrink-0 font-display text-[14px] font-extrabold text-ink-muted">{index + 1}.</span>
									{step}
								</li>
							))}
						</ol>
						<p className="mt-auto pt-5.5 text-[15.5px] leading-normal text-ink-muted">
							Nothing after 10 minutes? Check your spam folder or{" "}
							<a href={routes.contact} className="font-bold underline underline-offset-3">
								contact the helpdesk
							</a>
							.
						</p>
					</section>
				</div>
				<p className="mt-7 text-center text-[15px] text-ink-muted">For your privacy we never confirm whether an email address has an account.</p>
			</div>
		</AuthLayout>
	);
}
