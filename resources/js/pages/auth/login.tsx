import { useForm } from "@inertiajs/react";
import { Check } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, TextInput } from "@/components/ui/Form";
import { FlashMessage } from "@/components/ui/Interactive";
import { LogoMark } from "@/components/ui/Logo";
import { AuthLayout } from "@/layouts/Layouts";
import { routes } from "@/lib/routes";

const reasons = [
	"Save drafts and finish them whenever you like",
	"Import an existing protocol from PRIS (.json) or APAFiS (.xml)",
	"Choose an embargo: details go public after one year",
	"Talk to the PCT review team, right next to your fields"
];

export default function Login({ status }: { status?: string | null }) {
	const form = useForm({ email: "", password: "", remember: true });
	const [showPassword, setShowPassword] = useState(false);

	const submit = (event: FormEvent) => {
		event.preventDefault();
		form.post("/login", { onFinish: () => form.reset("password") });
	};

	return (
		<AuthLayout title="Log in">
			<div className="container-page">
				<div className="mx-auto grid max-w-[1160px] gap-3 rounded-[32px] bg-white p-3 shadow-[inset_0_0_0_1px_var(--color-line),var(--shadow-raised)] lg:grid-cols-[600px_minmax(0,1fr)]">
					<section aria-labelledby="login-title" className="px-5 pt-8 pb-8 sm:px-10 lg:pt-11 lg:pr-16 lg:pb-10 lg:pl-14">
						<p className="eyebrow">Researcher account</p>
						<h1 id="login-title" className="mt-3 text-4xl leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-5xl">
							Welcome back
						</h1>
						<p className="mt-3 text-lg leading-normal text-ink-muted">Log in to register, amend and follow up on your protocols.</p>

						{status && (
							<div className="mt-6">
								<FlashMessage tone="success">{status}</FlashMessage>
							</div>
						)}

						<form onSubmit={submit} className="mt-8 grid gap-5" noValidate>
							<Field label="Email address" error={form.errors.email}>
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
							<div>
								<div className="flex items-baseline justify-between gap-4">
									<label htmlFor="login-password" className="text-base font-bold">
										Password
									</label>
									<a href={routes.forgotPassword} className="text-[15.5px] font-bold underline underline-offset-3">
										Forgot password?
									</a>
								</div>
								<div className="relative mt-2">
									<TextInput
										id="login-password"
										type={showPassword ? "text" : "password"}
										autoComplete="current-password"
										required
										value={form.data.password}
										onChange={event => form.setData("password", event.target.value)}
										aria-invalid={!!form.errors.password}
										className="h-14 pr-21"
									/>
									<button
										type="button"
										aria-pressed={showPassword}
										onClick={() => setShowPassword(!showPassword)}
										className="absolute top-1.5 right-1.5 h-11 rounded-md px-3.5 text-[15.5px] font-bold text-link hover:bg-teal-50"
									>
										{showPassword ? "Hide" : "Show"}
									</button>
								</div>
								{form.errors.password && <p className="mt-2 text-[15px] font-semibold text-rust">{form.errors.password}</p>}
							</div>
							<Checkbox label="Keep me logged in on this device" checked={form.data.remember} onChange={event => form.setData("remember", event.target.checked)} />
							<Button type="submit" size="lg" arrow disabled={form.processing} className="w-full">
								Log in
							</Button>
						</form>

						<p className="mt-7 text-center text-base text-ink-muted">
							New to PreclinicalTrials.eu?{" "}
							<a href={routes.createAccount} className="font-bold underline underline-offset-3">
								Create a free account
							</a>
						</p>
					</section>

					<aside aria-labelledby="why-account" className="flex flex-col rounded-[22px] bg-mist px-6 pt-10 pb-8 sm:px-12 sm:pt-12 sm:pb-10">
						<p className="eyebrow">Why an account?</p>
						<h2 id="why-account" className="mt-3.5 max-w-[420px] text-2xl leading-[1.12] font-extrabold tracking-[-0.025em] sm:text-3xl">
							Your protocols, safely in one place.
						</h2>
						<ul className="mt-7 grid max-w-[410px] gap-4">
							{reasons.map(reason => (
								<li key={reason} className="flex items-start gap-3 text-md leading-normal">
									<Check size={20} strokeWidth={2.6} className="mt-0.5 shrink-0 text-teal-500" aria-hidden="true" />
									{reason}
								</li>
							))}
						</ul>
						<div className="mt-auto flex items-end justify-between gap-6 pt-8">
							<p className="max-w-[270px] text-[15.5px] leading-normal text-ink-muted">An account is free of charge. Your name is only published if you choose so.</p>
							<LogoMark size={112} glass="white" className="max-sm:hidden" />
						</div>
					</aside>
				</div>
			</div>
		</AuthLayout>
	);
}
