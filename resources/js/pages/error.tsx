import { usePage } from "@inertiajs/react";
import { ButtonAnchor } from "@/components/ui/Button";
import { PublicLayout } from "@/layouts/Layouts";
import { routes } from "@/lib/routes";

const texts: Record<number, [string, string]> = {
	403: ["You can’t open this page", "It belongs to someone else, or it is not public yet. Log in with the account that owns it, or ask the PCT team."],
	404: ["This page doesn’t exist", "The link may be old or mistyped. Search the register, or start from the home page."],
	429: ["Too many requests", "Please wait a minute and try again."],
	500: ["Something went wrong on our side", "Please try again in a moment. If it keeps happening, let the PCT team know."],
	503: ["We’ll be right back", "The register is being updated. Please try again in a few minutes."]
};

export default function ErrorPage({ status }: { status: number }) {
	const [title, text] = texts[status] ?? texts[500];
	const { auth } = usePage().props;
	return (
		<PublicLayout title={title}>
			<section className="container-page py-20 lg:py-28">
				<p className="eyebrow">Error {status}</p>
				<h1 className="mt-3 max-w-[720px] text-4xl leading-[1.08] font-extrabold tracking-[-0.035em] sm:text-5xl">{title}</h1>
				<p className="mt-4 max-w-[620px] text-lg leading-[1.55] text-ink-muted">{text}</p>
				<div className="mt-8 flex flex-wrap gap-3">
					<ButtonAnchor href={auth.user ? routes.dashboard : routes.home} arrow>
						{auth.user ? "Go to your dashboard" : "Go to the home page"}
					</ButtonAnchor>
					<ButtonAnchor href={routes.database} variant="secondary">
						Search the database
					</ButtonAnchor>
					{status === 403 && !auth.user && (
						<ButtonAnchor href={routes.login} variant="secondary">
							Log in
						</ButtonAnchor>
					)}
				</div>
			</section>
		</PublicLayout>
	);
}
