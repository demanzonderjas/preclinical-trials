import { useForm } from "@inertiajs/react";
import { Check } from "lucide-react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Note } from "@/components/ui/Content";
import { Field, FieldError, Select, TextInput } from "@/components/ui/Form";
import { PasswordField } from "@/components/ui/PasswordField";
import { AuthLayout } from "@/layouts/Layouts";
import { routes } from "@/lib/routes";

type Props = { countries: { value: string; label: string }[]; roles: string[] };

const reasons = [
	"Register protocols, save drafts, submit for review",
	"Amend a published protocol, with every change on record",
	"Choose an embargo, and request an extension when needed",
	"Answer questions from the PCT team and other researchers"
];

const steps = [
	["Verify your email", "Click the link we send to the address you entered"],
	["Start your first protocol", "Fill in the form, or import from PRIS (.json) or APAFiS (.xml)"],
	["Get a time-stamped PCT ID", "After a check by the PCT team, your protocol is registered"]
];

export default function Register({ countries, roles }: Props) {
	const form = useForm({
		first_name: "",
		last_name: "",
		email: "",
		password: "",
		institution: "",
		country: "",
		city: "",
		role: "",
		terms_conditions: false
	});

	const submit = (event: FormEvent) => {
		event.preventDefault();
		form.post("/register", { onFinish: () => form.reset("password") });
	};

	const text = (key: "first_name" | "last_name" | "institution" | "city", label: string, autoComplete: string) => (
		<Field label={label} required error={form.errors[key]}>
			{({ id, describedBy, invalid }) => (
				<TextInput id={id} autoComplete={autoComplete} required value={form.data[key]} onChange={event => form.setData(key, event.target.value)} aria-describedby={describedBy} aria-invalid={invalid} className="h-14" />
			)}
		</Field>
	);

	return (
		<AuthLayout title="Create account">
			<div className="container-page">
				<div className="mx-auto grid max-w-[1160px] gap-3 rounded-[32px] bg-white p-3 shadow-[inset_0_0_0_1px_var(--color-line),var(--shadow-raised)] lg:grid-cols-[600px_minmax(0,1fr)]">
					<section aria-labelledby="register-title" className="px-5 pt-8 pb-8 sm:px-10 lg:pt-11 lg:pr-16 lg:pb-10 lg:pl-14">
						<p className="eyebrow">Free researcher account</p>
						<h1 id="register-title" className="mt-3 text-4xl leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-[48px]">
							Create your account
						</h1>
						<p className="mt-3 text-lg leading-normal text-ink-muted">Two minutes, then you can register your first protocol. Fields with an asterisk are mandatory.</p>

						<form onSubmit={submit} className="mt-8 grid gap-5" noValidate>
							<div className="grid gap-5 sm:grid-cols-2">
								{text("first_name", "First name", "given-name")}
								{text("last_name", "Last name", "family-name")}
							</div>
							<Field label="Email address" required help="We'll send a verification link to this address. Your institutional email works best." error={form.errors.email}>
								{({ id, describedBy, invalid }) => (
									<TextInput id={id} type="email" autoComplete="email" required value={form.data.email} onChange={event => form.setData("email", event.target.value)} aria-describedby={describedBy} aria-invalid={invalid} className="h-14" />
								)}
							</Field>
							<PasswordField value={form.data.password} onChange={value => form.setData("password", value)} error={form.errors.password} />
							{text("institution", "Institution", "organization")}
							<div className="grid gap-5 sm:grid-cols-2">
								<Field label="Country" required error={form.errors.country}>
									{({ id, describedBy, invalid }) => (
										<Select id={id} autoComplete="country" required value={form.data.country} onChange={event => form.setData("country", event.target.value)} aria-describedby={describedBy} aria-invalid={invalid} className="h-14">
											<option value="" disabled>
												Choose a country
											</option>
											{countries.map(country => (
												<option key={country.value} value={country.value}>
													{country.label}
												</option>
											))}
										</Select>
									)}
								</Field>
								{text("city", "City", "address-level2")}
							</div>
							<Field label="Role" required error={form.errors.role}>
								{({ id, describedBy, invalid }) => (
									<Select id={id} required value={form.data.role} onChange={event => form.setData("role", event.target.value)} aria-describedby={describedBy} aria-invalid={invalid} className="h-14">
										<option value="" disabled>
											Choose your role
										</option>
										{roles.map(role => (
											<option key={role} value={role}>
												{role}
											</option>
										))}
									</Select>
								)}
							</Field>
							<Note tone="teal" className="py-3">
								These details are only visible to you and the PCT team. On each protocol you decide whether your name is published.
							</Note>
							<div>
								<label className="flex cursor-pointer items-start gap-3 text-base">
									<input type="checkbox" checked={form.data.terms_conditions} onChange={event => form.setData("terms_conditions", event.target.checked)} className="mt-0.5 size-5 shrink-0 accent-ink" aria-invalid={!!form.errors.terms_conditions} />
									<span>
										I have read the{" "}
										<a href={routes.terms} target="_blank" className="font-bold underline underline-offset-3">
											terms and conditions
										</a>{" "}
										and agree to be bound by them{" "}
										<span aria-hidden="true" className="text-rust">
											*
										</span>
									</span>
								</label>
								{form.errors.terms_conditions && <FieldError className="mt-2">Please accept the terms and conditions.</FieldError>}
							</div>
							<Button type="submit" size="lg" arrow disabled={form.processing} className="w-full">
								Create my account
							</Button>
						</form>
						<p className="mt-7 text-center text-base text-ink-muted">
							Already registered?{" "}
							<a href={routes.login} className="font-bold underline underline-offset-3">
								Log in
							</a>
						</p>
					</section>

					<aside aria-labelledby="why-title" className="self-start rounded-[22px] bg-mist px-6 pt-10 pb-8 sm:px-11 sm:pt-12 sm:pb-11">
						<p className="eyebrow">Why do I need an account?</p>
						<h2 id="why-title" className="mt-3.5 text-2xl leading-[1.12] font-extrabold tracking-[-0.025em] sm:text-[34px]">
							Your plans need an owner, not a public name.
						</h2>
						<p className="mt-4 text-md leading-[1.55] text-ink-muted">Every protocol in the register is kept and amended by the account that created it. That is how the audit trail stays trustworthy.</p>
						<ul className="mt-7 grid gap-4">
							{reasons.map(reason => (
								<li key={reason} className="flex items-start gap-3 text-md leading-normal">
									<Check size={20} strokeWidth={2.6} className="mt-0.5 shrink-0 text-teal-500" aria-hidden="true" />
									{reason}
								</li>
							))}
						</ul>
						<div className="mt-10 rounded-card bg-white p-6 shadow-[inset_0_0_0_1px_var(--color-line)]">
							<p className="font-display text-lg font-bold">What happens next</p>
							<ol className="mt-4 grid gap-4">
								{steps.map(([title, text], index) => (
									<li key={title} className="flex gap-3.5">
										<span className={`flex size-8 shrink-0 items-center justify-center rounded-full font-display text-sm font-extrabold ${index === 0 ? "bg-peach-300" : "shadow-[inset_0_0_0_2px_var(--color-teal-300)]"}`}>{index + 1}</span>
										<span>
											<span className="block font-bold">{title}</span>
											<span className="block text-[15px] text-ink-muted">{text}</span>
										</span>
									</li>
								))}
							</ol>
						</div>
					</aside>
				</div>
			</div>
		</AuthLayout>
	);
}
