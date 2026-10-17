import { Link, useForm } from "@inertiajs/react";
import { ShieldCheck, Smartphone } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Content";
import { Field, TextInput } from "@/components/ui/Form";
import { AuthLayout } from "@/layouts/Layouts";
import { routes } from "@/lib/routes";

type Props = { mode: "setup" | "challenge"; qr: string | null; secret: string | null };

const titles = { setup: "Set up two-factor authentication", challenge: "Enter your code" };

/** The admin area's second factor: set up an authenticator app once, then a code once per session. */
export default function TwoFactor({ mode, qr, secret }: Props) {
	const Icon = mode === "setup" ? Smartphone : ShieldCheck;

	return (
		<AuthLayout title={titles[mode]}>
			<div className="container-page">
				<Panel className="mx-auto max-w-[640px] px-6 py-9 sm:px-12 sm:py-12">
					<span className="flex size-20 items-center justify-center rounded-[22px] bg-teal-50">
						<Icon size={40} strokeWidth={1.6} aria-hidden="true" />
					</span>
					<p className="eyebrow mt-6">Admin area</p>
					<h1 className="mt-3 text-4xl leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-5xl">{titles[mode]}</h1>
					{mode === "setup" && <Setup qr={qr!} secret={secret!} />}
					{mode === "challenge" && <Challenge />}
					<p className="mt-8 text-[15px] text-ink-muted">
						Not an admin task?{" "}
						<Link href={routes.dashboard} className="font-bold underline underline-offset-3">
							Go to your workspace
						</Link>
					</p>
				</Panel>
			</div>
		</AuthLayout>
	);
}

function CodeForm({ action, label, help, submit }: { action: string; label: string; help: string; submit: string }) {
	const form = useForm({ code: "" });
	const onSubmit = (event: FormEvent) => {
		event.preventDefault();
		form.post(action, { onFinish: () => form.reset("code") });
	};

	return (
		<form onSubmit={onSubmit} className="mt-8 grid gap-5" noValidate>
			<Field label={label} help={help} error={form.errors.code}>
				{({ id, describedBy, invalid }) => (
					<TextInput
						id={id}
						inputMode="numeric"
						autoComplete="one-time-code"
						autoFocus
						required
						value={form.data.code}
						onChange={event => form.setData("code", event.target.value)}
						aria-describedby={describedBy}
						aria-invalid={invalid}
						className="h-14 font-mono text-xl tracking-[0.2em]"
					/>
				)}
			</Field>
			<Button type="submit" size="lg" arrow disabled={form.processing || !form.data.code.trim()} className="w-full">
				{submit}
			</Button>
		</form>
	);
}

function Setup({ qr, secret }: { qr: string; secret: string }) {
	const [showSecret, setShowSecret] = useState(false);

	return (
		<>
			<p className="mt-4 text-lg leading-normal text-ink-muted">
				The admin area asks for a code from an authenticator app, such as 1Password, Google Authenticator or Microsoft Authenticator. Scan this QR code with the app.
			</p>
			<div className="mt-7 flex flex-col items-center gap-4 rounded-[22px] bg-mist p-6 sm:flex-row sm:items-center">
				<div role="img" aria-label="QR code for your authenticator app" className="shrink-0 rounded-xl bg-white p-3" dangerouslySetInnerHTML={{ __html: qr }} />
				<div className="text-[15.5px] leading-normal text-ink-muted">
					<p>Can't scan it? Enter the setup key in the app instead.</p>
					{showSecret ? (
						<code className="mt-2 block font-mono text-base font-bold break-all text-ink select-all">{secret.match(/.{1,4}/g)!.join(" ")}</code>
					) : (
						<button type="button" onClick={() => setShowSecret(true)} className="mt-2 font-bold text-link underline underline-offset-3">
							Show the setup key
						</button>
					)}
				</div>
			</div>
			<CodeForm action={`${routes.admin.twoFactor}/confirm`} label="Code from the app" help="Six digits, renewed every 30 seconds." submit="Turn on two-factor authentication" />
		</>
	);
}

function Challenge() {
	return (
		<>
			<p className="mt-4 text-lg leading-normal text-ink-muted">Open your authenticator app and enter the code for PreclinicalTrials.eu. You only need to do this once per session.</p>
			<CodeForm action={routes.admin.twoFactor} label="Code" help="The six digits from your app." submit="Continue to the admin area" />
			<p className="mt-6 text-[15px] leading-normal text-ink-muted">Lost your phone? Ask the PCT developer to reset two-factor authentication for your account.</p>
		</>
	);
}
