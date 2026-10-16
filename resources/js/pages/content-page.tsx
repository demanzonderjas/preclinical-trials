import { ChevronRight } from "lucide-react";
import { Prose } from "@/components/ui/Prose";
import { PublicLayout } from "@/layouts/Layouts";
import { routes } from "@/lib/routes";

type Props = { page: { title: string; subtitle: string | null; updated_on: string | null; sections: string[] } };

/** A page the PCT team writes in the admin area (title, subtitle, text sections). */
export default function ContentPage({ page }: Props) {
	return (
		<PublicLayout title={page.title} description={page.subtitle ?? undefined}>
			<section aria-labelledby="page-title" className="bg-teal-50">
				<div className="container-page py-10 lg:py-14">
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
								{page.title}
							</li>
						</ol>
					</nav>
					<h1 id="page-title" className="mt-6 text-4xl leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-5xl">
						{page.title}
					</h1>
					{page.subtitle && <p className="mt-4 max-w-3xl text-lg leading-[1.55] sm:text-[19px]">{page.subtitle}</p>}
				</div>
			</section>
			<div className="container-page grid gap-10 py-12 lg:py-16">
				{page.sections.map((html, index) => (
					<Prose key={index} html={html} />
				))}
				{page.updated_on && <p className="text-[14.5px] text-ink-muted">Last updated {page.updated_on}</p>}
			</div>
		</PublicLayout>
	);
}
