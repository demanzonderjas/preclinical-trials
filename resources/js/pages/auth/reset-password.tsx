import { useForm } from "@inertiajs/react";
import { ChevronLeft } from "lucide-react";
import type { FormEvent } from "react";
import { Panel } from "@/components/ui/Content";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Form";
import { PasswordField } from "@/components/ui/PasswordField";
import { AuthLayout } from "@/layouts/Layouts";
import { routes } from "@/lib/routes";

/** Step two of a reset: opened from the link in the mail. */
export default function ResetPassword({ token, email }: { token: string; email: string }) {
	const form = useForm({ token, email, password: "", password_confirmation: "" });

	const submit = (event: FormEvent) => {
		event.preventDefault();
		form.transform(data => ({ ...data, password_confirmation: data.password }));
		form.post("/reset-password", { onFinish: () => form.reset("password") });
	};

	return (
		<AuthLayout title="Choose a new password">
			<div className="container-page">
				<Panel className="mx-auto max-w-[600px] px-6 py-9 sm:px-12 sm:py-11">
					<a href={routes.login} className="inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-3">
						<ChevronLeft size={14} strokeWidth={2.4} aria-hidden="true" />
						Back to log in
					</a>
					<h1 className="mt-4 text-4xl leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-5xl">Choose a new password</h1>
					<p className="mt-3 text-lg text-ink-muted">Pick one you don’t use anywhere else. You’ll log in with it straight after.</p>
					<form onSubmit={submit} className="mt-8 grid gap-5" noValidate>
						<Field label="Email address" required error={form.errors.email}>
							{({ id, describedBy, invalid }) => (
								<TextInput id={id} type="email" autoComplete="email" required value={form.data.email} onChange={event => form.setData("email", event.target.value)} aria-describedby={describedBy} aria-invalid={invalid} className="h-14" />
							)}
						</Field>
						<PasswordField label="New password" value={form.data.password} onChange={value => form.setData("password", value)} error={form.errors.password} />
						<Button type="submit" size="lg" arrow disabled={form.processing} className="w-full">
							Save new password
						</Button>
					</form>
				</Panel>
			</div>
		</AuthLayout>
	);
}
