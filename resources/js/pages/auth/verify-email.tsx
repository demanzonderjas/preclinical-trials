import { Link, router } from "@inertiajs/react";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Content";
import { FlashMessage } from "@/components/ui/Interactive";
import { AuthLayout } from "@/layouts/Layouts";
import { routes } from "@/lib/routes";

export default function VerifyEmail({ email, sent }: { email: string; sent: boolean }) {
	return (
		<AuthLayout title="Verify your email">
			<div className="container-page">
				<Panel className="mx-auto max-w-[640px] px-6 py-9 text-center sm:px-12 sm:py-12">
					<span className="mx-auto flex size-20 items-center justify-center rounded-[22px] bg-teal-50">
						<MailCheck size={40} strokeWidth={1.6} aria-hidden="true" />
					</span>
					<p className="eyebrow mt-6">Step 1 of 3</p>
					<h1 className="mt-3 text-4xl leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-5xl">Verify your email</h1>
					<p className="mx-auto mt-4 max-w-md text-lg leading-normal text-ink-muted">
						We sent a link to <strong className="text-ink">{email}</strong>. Click it to finish creating your account, then you can register your first protocol.
					</p>
					{sent && (
						<div className="mt-6 text-left">
							<FlashMessage tone="success">A new verification link is on its way.</FlashMessage>
						</div>
					)}
					<div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
						<Button variant="secondary" onClick={() => router.post("/email/verification-notification", {}, { preserveScroll: true })}>
							Send the link again
						</Button>
						<Link href="/logout" method="post" as="button" className="inline-flex h-13 items-center justify-center rounded-full px-6 font-display font-extrabold text-ink hover:bg-teal-50">
							Log out
						</Link>
					</div>
					<p className="mt-8 text-[15px] text-ink-muted">
						Nothing after 10 minutes? Check your spam folder or{" "}
						<a href={routes.contact} className="font-bold underline underline-offset-3">
							contact the helpdesk
						</a>
						.
					</p>
				</Panel>
			</div>
		</AuthLayout>
	);
}
