import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ArrowLink } from "@/components/ui/Content";
import { Prose } from "@/components/ui/Prose";
import { PublicLayout } from "@/layouts/Layouts";
import { routes } from "@/lib/routes";
import { type NewsItem, newsHref } from "./index";

export default function NewsArticle({ item, related }: { item: NewsItem; related: NewsItem[] }) {
	return (
		<PublicLayout title={item.title} description={item.summary || undefined}>
			<article aria-labelledby="article-title">
				<header className="bg-teal-50">
					<div className="container-page py-10 lg:py-14">
						<nav aria-label="Breadcrumb">
							<ol className="flex flex-wrap items-center gap-2 text-[15px]">
								<li>
									<a href={routes.home} className="underline underline-offset-3">
										Home
									</a>
								</li>
								<li aria-hidden="true">
									<ChevronRight size={14} strokeWidth={2.4} className="text-ink-muted" />
								</li>
								<li>
									<a href={routes.news} className="underline underline-offset-3">
										News
									</a>
								</li>
							</ol>
						</nav>
						<div className="mt-6 flex flex-wrap items-center gap-2.5">
							{item.category_label && <Badge tone="teal">{item.category_label}</Badge>}
							<time className="text-[15px] text-ink-muted">{item.date_long}</time>
						</div>
						<h1 id="article-title" className="mt-4 max-w-4xl text-4xl leading-[1.08] font-extrabold tracking-[-0.035em] sm:text-5xl">
							{item.title}
						</h1>
						{item.summary && <p className="mt-5 max-w-3xl text-lg leading-[1.6] sm:text-[19px]">{item.summary}</p>}
					</div>
				</header>
				<div className="container-page py-12 lg:py-16">
					{item.image && <img src={item.image} alt="" className="mb-10 max-h-[480px] w-full max-w-4xl rounded-[28px] object-cover" />}
					<Prose html={item.content} />
				</div>
			</article>
			{related.length > 0 && (
				<section aria-labelledby="related-title" className="border-t border-line bg-mist py-14">
					<div className="container-page">
						<div className="flex items-baseline justify-between gap-4">
							<h2 id="related-title" className="text-2xl font-extrabold tracking-[-0.02em]">
								More news
							</h2>
							<ArrowLink href={routes.news}>All updates</ArrowLink>
						</div>
						<ul className="mt-6 grid gap-4 md:grid-cols-3">
							{related.map(other => (
								<li key={other.id}>
									<a href={newsHref(other)} className="flex h-full flex-col rounded-card border border-line bg-white p-6 text-ink hover:border-teal-300 hover:text-ink">
										<span className="text-[14px] text-ink-muted">{other.date}</span>
										<span className="mt-2 font-display text-lg leading-snug font-bold">{other.title}</span>
									</a>
								</li>
							))}
						</ul>
					</div>
				</section>
			)}
		</PublicLayout>
	);
}
