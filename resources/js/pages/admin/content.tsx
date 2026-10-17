import { router, useForm, usePage } from "@inertiajs/react";
import { ArrowDown, ArrowLeft, ArrowUp, Check, GripVertical, ImageIcon } from "lucide-react";
import { type FormEvent, type ReactNode, useState } from "react";
import { RichText } from "@/components/admin/RichText";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Content";
import { Field, Select, TextInput } from "@/components/ui/Form";
import { Dialog } from "@/components/ui/Interactive";
import { AdminLayout } from "@/layouts/Layouts";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/dates";
import { request } from "@/lib/http";
import { routes } from "@/lib/routes";

type Tab = "news" | "faq" | "pages" | "ambassadors";
type Option = { value: string; label: string };
type News = { id: number; title: string; summary: string | null; content: string | null; image: string | null; category: string | null; status: "draft" | "published"; publish_date: string | null; updated_at: string | null };
type Faq = { id: number; title: string; content: string; status: "draft" | "published"; audiences: string[]; category_id: number; updated_at: string | null };
type Category = { id: number; name: string; items: Faq[] };
type ContentPage = { id: number; title: string; subtitle: string | null; slug: string; blocks: string[]; updated_at: string | null };
type Ambassador = { id: number; name: string; description: string; place: string; latitude: string; longitude: string };

type Props = {
	tab: Tab;
	counts: Record<Tab, number>;
	news: News[];
	categories: Option[];
	faq: Category[];
	audiences: Option[];
	pages: ContentPage[];
	ambassadors: Ambassador[];
};

const tabs: [Tab, string][] = [
	["news", "News"],
	["faq", "FAQ"],
	["pages", "Pages"],
	["ambassadors", "Ambassadors"]
];

/** The item being edited: ?edit=12, or ?edit=new for a new one. */
function useEditing() {
	const { url } = usePage();
	const edit = new URLSearchParams(url.split("?")[1] ?? "").get("edit");
	return edit === "new" ? "new" : edit ? Number(edit) : null;
}

const go = (tab: Tab, edit?: number | "new" | null) => router.get(routes.admin.content, { tab, ...(edit ? { edit } : {}) }, { preserveState: true, preserveScroll: true, replace: true });

export default function Content(props: Props) {
	const editing = useEditing();

	// News items and pages are edited on a page of their own.
	if (editing !== null && props.tab === "news") {
		const item = editing === "new" ? null : props.news.find(other => other.id === editing);
		if (item !== undefined) {
			return (
				<EditorPage title={item ? item.title : "New news item"} back={() => go("news")} backLabel="All news">
					<NewsForm key={editing} item={item} categories={props.categories} />
				</EditorPage>
			);
		}
	}
	if (editing !== null && props.tab === "pages") {
		const page = props.pages.find(other => other.id === editing);
		if (page) {
			return (
				<EditorPage title={page.title} back={() => go("pages")} backLabel="All pages">
					<PageForm key={page.id} page={page} />
				</EditorPage>
			);
		}
	}

	return (
		<AdminLayout title="Content">
			<section aria-labelledby="content-title" className="bg-teal-50">
				<div className="container-page pt-11 pb-11">
					<p className="eyebrow">Admin · Website</p>
					<h1 id="content-title" className="mt-3 text-4xl leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-[44px]">
						Content
					</h1>
					<p className="mt-3 text-lg">Change the content of the website: news, questions and answers, pages and ambassadors.</p>
				</div>
			</section>

			<div className="container-page pt-8 pb-16">
				<div role="tablist" aria-label="Content type" className="inline-flex flex-wrap gap-1 rounded-full bg-mist p-1">
					{tabs.map(([key, label]) => (
						<button
							key={key}
							type="button"
							role="tab"
							aria-selected={props.tab === key}
							onClick={() => go(key)}
							className={cn("inline-flex h-11 items-center gap-2 rounded-full px-5 font-display text-[15.5px] font-extrabold", props.tab === key ? "bg-ink text-white" : "hover:bg-white")}
						>
							{label}
							<span className={cn("font-sans text-[13.5px] font-semibold", props.tab === key ? "text-white/75" : "text-ink-muted")}>{props.counts[key]}</span>
						</button>
					))}
				</div>

				<div className="mt-6">
					{props.tab === "news" && <NewsTab news={props.news} />}
					{props.tab === "faq" && <FaqTab categories={props.faq} audiences={props.audiences} />}
					{props.tab === "pages" && <PagesTab pages={props.pages} />}
					{props.tab === "ambassadors" && <AmbassadorsTab ambassadors={props.ambassadors} />}
				</div>
			</div>
		</AdminLayout>
	);
}

/* -------------------------------------------------------------------------- */

function Split({ list, editor }: { list: ReactNode; editor: ReactNode }) {
	return (
		<div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_460px]">
			<div className="min-w-0">{list}</div>
			<aside className="rounded-card bg-mist px-6 py-7 lg:sticky lg:top-6">{editor}</aside>
		</div>
	);
}

function EditorPage({ title, back, backLabel, children }: { title: string; back: () => void; backLabel: string; children: ReactNode }) {
	return (
		<AdminLayout title={title}>
			<div className="container-page pt-8 pb-16">
				<button type="button" onClick={back} className="inline-flex items-center gap-2 font-display text-[15.5px] font-extrabold text-link">
					<ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />
					{backLabel}
				</button>
				<div className="mt-5">{children}</div>
			</div>
		</AdminLayout>
	);
}

function EditorHead({ title, sub, page }: { title: string; sub?: string | null; page?: boolean }) {
	return (
		<div className={page ? "mb-8" : "mb-6"}>
			{page ? <h1 className="text-4xl leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-[44px]">{title}</h1> : <h2 className="text-2xl font-extrabold tracking-[-0.02em]">{title}</h2>}
			{sub && <p className="mt-1 text-[14.5px] text-ink-muted">{sub}</p>}
		</div>
	);
}

function StatusChip({ status }: { status: "draft" | "published" }) {
	return status === "published" ? (
		<Badge tone="teal-ring" size="sm" icon={<Check size={12} strokeWidth={2.8} aria-hidden="true" />}>
			Published
		</Badge>
	) : (
		<Badge tone="neutral" dot="grey" size="sm">
			Draft
		</Badge>
	);
}

function RowActions({ view, onEdit, onDelete, label }: { view?: string; onEdit: () => void; onDelete: () => void; label: string }) {
	return (
		<span className="flex items-center gap-4 text-[15px]">
			{view && (
				<a href={view} className="font-display font-extrabold text-link">
					View<span className="sr-only"> {label}</span>
				</a>
			)}
			<button type="button" onClick={onEdit} className="font-display font-extrabold text-link">
				Edit<span className="sr-only"> {label}</span>
			</button>
			<button type="button" onClick={onDelete} className="font-display font-extrabold">
				Delete<span className="sr-only"> {label}</span>
			</button>
		</span>
	);
}

function ConfirmDelete({ what, url, onClose }: { what: string; url: string; onClose: () => void }) {
	return (
		<Dialog
			open
			size="sm"
			onClose={onClose}
			title={`Delete ${what}?`}
			description="This can’t be undone."
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Keep it
					</Button>
					<Button variant="danger" onClick={() => router.delete(url, { preserveScroll: true, onFinish: onClose })}>
						Delete
					</Button>
				</>
			}
		/>
	);
}

function FormActions({ processing, onCancel }: { processing: boolean; onCancel: () => void }) {
	return (
		<div className="mt-6 flex gap-2.5">
			<Button type="submit" disabled={processing}>
				Save
			</Button>
			<Button variant="secondary" onClick={onCancel}>
				Cancel
			</Button>
		</div>
	);
}

/* News ---------------------------------------------------------------------- */

function NewsTab({ news }: { news: News[] }) {
	const [deleting, setDeleting] = useState<News | null>(null);
	const published = news.filter(item => item.status === "published").length;

	return (
		<>
			<div className="flex flex-wrap items-center justify-between gap-3">
				<p className="text-[15px] text-ink-muted">
					{news.length} news items · {published} published, {news.length - published} draft
				</p>
				<Button onClick={() => go("news", "new")}>Add news item</Button>
			</div>
			{news.length === 0 ? (
				<div className="mt-5">
					<EmptyState title="No news yet" />
				</div>
			) : (
				<div className="mt-5 overflow-hidden rounded-card border border-line">
					<div className="hidden grid-cols-[minmax(0,1fr)_130px_120px_170px] gap-4 bg-mist px-5 py-3.5 md:grid">
						{["Title", "Publish date", "Status", "Admin action"].map(header => (
							<span key={header} className="eyebrow text-[11.5px]">
								{header}
							</span>
						))}
					</div>
					<ul className="divide-y divide-line bg-white">
						{news.map(item => (
							<li key={item.id} className="grid gap-2 px-5 py-4 md:grid-cols-[minmax(0,1fr)_130px_120px_170px] md:items-center md:gap-4">
								<p className="font-bold">{item.title}</p>
								<p className="text-[14px]">
									<span className="block font-semibold">{item.publish_date ? formatDate(item.publish_date) : "Not scheduled"}</span>
									{item.updated_at && <span className="text-ink-muted">Updated {formatDate(item.updated_at)}</span>}
								</p>
								<span>
									<StatusChip status={item.status} />
								</span>
								<RowActions label={item.title} view={item.status === "published" ? `/news/view-item/${item.id}` : undefined} onEdit={() => go("news", item.id)} onDelete={() => setDeleting(item)} />
							</li>
						))}
					</ul>
				</div>
			)}
			{deleting && <ConfirmDelete what={`“${deleting.title}”`} url={`/admin/content/news/${deleting.id}`} onClose={() => setDeleting(null)} />}
		</>
	);
}

function EmptyEditor({ what }: { what: string }) {
	return (
		<div className="py-8 text-center">
			<p className="text-xl font-extrabold">Nothing selected</p>
			<p className="mt-2 text-ink-muted">Choose Edit next to {what}, or add a new one.</p>
		</div>
	);
}

function NewsForm({ item, categories }: { item: News | null; categories: Option[] }) {
	const form = useForm({
		title: item?.title ?? "",
		summary: item?.summary ?? "",
		content: item?.content ?? "",
		image: item?.image ?? "",
		category: item?.category ?? "",
		status: item?.status ?? "draft",
		publish_date: item?.publish_date ?? ""
	});
	const [uploading, setUploading] = useState(false);
	const submit = (event: FormEvent) => {
		event.preventDefault();
		form.transform(data => ({ ...data, image: data.image || null, category: data.category || null, publish_date: data.publish_date || null }));
		if (item) form.put(`/admin/content/news/${item.id}`, { preserveScroll: true });
		else form.post("/admin/content/news", { preserveScroll: true });
	};
	const upload = async (file: File | undefined) => {
		if (!file) return;
		setUploading(true);
		const body = new FormData();
		body.append("image", file);
		try {
			form.setData("image", (await request<{ filename: string }>("POST", "/admin/content/images", body)).filename);
		} finally {
			setUploading(false);
		}
	};

	return (
		<form onSubmit={submit} noValidate>
			<EditorHead page title={item ? "Edit news item" : "New news item"} sub={item?.updated_at ? `Last updated ${formatDate(item.updated_at)}` : null} />
			<div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
				<div className="grid min-w-0 gap-5">
					<Field label="Title" required error={form.errors.title}>
						{({ id, invalid }) => <TextInput id={id} value={form.data.title} onChange={event => form.setData("title", event.target.value)} aria-invalid={invalid} className="h-14 text-lg font-bold" />}
					</Field>
					<RichText label="Summary" required value={form.data.summary} onChange={html => form.setData("summary", html)} invalid={!!form.errors.summary} minHeight={120} />
					{form.errors.summary && <p className="-mt-3 text-[14.5px] font-semibold text-rust">{form.errors.summary}</p>}
					<RichText label="Content" required value={form.data.content} onChange={html => form.setData("content", html)} invalid={!!form.errors.content} minHeight={420} />
					{form.errors.content && <p className="-mt-3 text-[14.5px] font-semibold text-rust">{form.errors.content}</p>}
				</div>
				<aside className="grid gap-5 rounded-card bg-mist px-6 py-7 lg:sticky lg:top-6">
					<Field label="Status" required>
						{({ id }) => (
							<Select id={id} value={form.data.status} onChange={event => form.setData("status", event.target.value as "draft" | "published")}>
								<option value="draft">Draft</option>
								<option value="published">Published</option>
							</Select>
						)}
					</Field>
					<Field label="Publish date" error={form.errors.publish_date}>
						{({ id }) => <TextInput id={id} type="date" value={form.data.publish_date} onChange={event => form.setData("publish_date", event.target.value)} className="h-13" />}
					</Field>
					<Field label="Category" help="Items without a category only show under “All updates”.">
						{({ id, describedBy }) => (
							<Select id={id} value={form.data.category} onChange={event => form.setData("category", event.target.value)} aria-describedby={describedBy}>
								<option value="">No category</option>
								{categories.map(category => (
									<option key={category.value} value={category.value}>
										{category.label}
									</option>
								))}
							</Select>
						)}
					</Field>
					<div>
						<p className="font-bold">Image</p>
						<div className="mt-2 overflow-hidden rounded-card border-[1.5px] border-dashed border-line-strong bg-white">
							<span aria-hidden="true" className="flex aspect-[16/9] items-center justify-center overflow-hidden bg-teal-50">
								{form.data.image ? <img src={`/images/news/${form.data.image}`} alt="" className="size-full object-cover" /> : <ImageIcon size={28} strokeWidth={2} className="text-teal-500" />}
							</span>
							<div className="flex items-center gap-4 px-4 py-3">
								<span className="min-w-0 flex-1 truncate text-[14.5px] font-bold">{form.data.image || "No image"}</span>
								<label className="cursor-pointer font-display font-extrabold text-link">
									{uploading ? "Uploading…" : form.data.image ? "Replace" : "Upload"}
									<input type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="sr-only" onChange={event => upload(event.target.files?.[0])} />
								</label>
								{form.data.image && (
									<button type="button" onClick={() => form.setData("image", "")} className="font-display font-extrabold">
										Remove
									</button>
								)}
							</div>
						</div>
					</div>
					<FormActions processing={form.processing} onCancel={() => go("news")} />
				</aside>
			</div>
		</form>
	);
}

/* Questions and answers ------------------------------------------------------ */

function FaqTab({ categories, audiences }: { categories: Category[]; audiences: Option[] }) {
	const editing = useEditing();
	const [deleting, setDeleting] = useState<Faq | null>(null);
	const [dragging, setDragging] = useState<number | null>(null);
	const all = categories.flatMap(category => category.items);
	const current = editing === "new" ? null : all.find(item => item.id === editing) ?? null;
	const audienceLabel = (item: Faq) => (item.audiences.length >= audiences.length ? "For all visitors" : item.audiences.length ? `For ${item.audiences.map(key => audiences.find(a => a.value === key)?.label.split(" /")[0].toLowerCase()).join(", ")}` : "Not shown to an audience");

	const move = (category: Category, from: number, to: number) => {
		if (to < 0 || to >= category.items.length || from === to) return;
		const ids = category.items.map(item => item.id);
		const [moved] = ids.splice(from, 1);
		ids.splice(to, 0, moved);
		router.put(`/admin/content/faq-categories/${category.id}/order`, { ids }, { preserveScroll: true, preserveState: true });
	};

	return (
		<Split
			list={
				<>
					<div className="flex flex-wrap items-center justify-between gap-3">
						<p className="text-[15px] text-ink-muted">
							{all.length} questions in {categories.length} categories · drag a handle or use the arrows to change the order
						</p>
						<Button onClick={() => go("faq", "new")}>Add FAQ item</Button>
					</div>
					<div className="mt-5 grid gap-5">
						{categories.map(category => (
							<section key={category.id} aria-labelledby={`category-${category.id}`} className="overflow-hidden rounded-card border border-line">
								<h3 id={`category-${category.id}`} className="flex items-baseline gap-3 bg-mist px-5 py-3.5 text-lg font-bold">
									{category.name} <span className="text-[14px] font-normal text-ink-muted">{category.items.length} questions</span>
								</h3>
								<ol className="divide-y divide-line bg-white">
									{category.items.map((item, index) => (
										<li
											key={item.id}
											draggable
											onDragStart={() => setDragging(index)}
											onDragOver={event => event.preventDefault()}
											onDrop={() => {
												if (dragging !== null) move(category, dragging, index);
												setDragging(null);
											}}
											className={cn("flex flex-wrap items-center gap-3 px-4 py-3.5 sm:flex-nowrap", item.id === editing && "bg-teal-50")}
										>
											<GripVertical size={18} strokeWidth={2} className="shrink-0 cursor-grab text-ink-subtle" aria-hidden="true" />
											<span className="flex shrink-0 flex-col">
												<button type="button" disabled={index === 0} onClick={() => move(category, index, index - 1)} className="rounded p-0.5 hover:bg-mist disabled:invisible" aria-label={`Move “${item.title}” up`}>
													<ArrowUp size={14} strokeWidth={2.4} aria-hidden="true" />
												</button>
												<button type="button" disabled={index === category.items.length - 1} onClick={() => move(category, index, index + 1)} className="rounded p-0.5 hover:bg-mist disabled:invisible" aria-label={`Move “${item.title}” down`}>
													<ArrowDown size={14} strokeWidth={2.4} aria-hidden="true" />
												</button>
											</span>
											<span className="min-w-0 flex-1 font-semibold">{item.title}</span>
											<span className="shrink-0 text-right">
												<StatusChip status={item.status} />
												<span className="mt-0.5 block text-[13px] text-ink-muted">{audienceLabel(item)}</span>
											</span>
											<RowActions label={item.title} onEdit={() => go("faq", item.id)} onDelete={() => setDeleting(item)} />
										</li>
									))}
								</ol>
							</section>
						))}
					</div>
					{deleting && <ConfirmDelete what={`“${deleting.title}”`} url={`/admin/content/faq/${deleting.id}`} onClose={() => setDeleting(null)} />}
				</>
			}
			editor={editing === null ? <EmptyEditor what="a question" /> : <FaqForm key={editing} item={current} categories={categories} audiences={audiences} />}
		/>
	);
}

function FaqForm({ item, categories, audiences }: { item: Faq | null; categories: Category[]; audiences: Option[] }) {
	const form = useForm({
		title: item?.title ?? "",
		content: item?.content ?? "",
		category_id: String(item?.category_id ?? categories[0]?.id ?? ""),
		status: item?.status ?? "draft",
		audiences: item?.audiences ?? audiences.map(audience => audience.value)
	});
	const submit = (event: FormEvent) => {
		event.preventDefault();
		if (item) form.put(`/admin/content/faq/${item.id}`, { preserveScroll: true });
		else form.post("/admin/content/faq", { preserveScroll: true });
	};
	const category = categories.find(c => String(c.id) === form.data.category_id);

	return (
		<form onSubmit={submit} noValidate>
			<EditorHead title={item ? "Edit FAQ item" : "New FAQ item"} sub={item ? `Category ${category?.name ?? ""}${item.updated_at ? ` · last updated ${formatDate(item.updated_at)}` : ""}` : null} />
			<div className="grid gap-5">
				<Field label="Title" required error={form.errors.title}>
					{({ id, invalid }) => <TextInput id={id} value={form.data.title} onChange={event => form.setData("title", event.target.value)} aria-invalid={invalid} className="h-13" />}
				</Field>
				<RichText label="Content" required value={form.data.content} onChange={html => form.setData("content", html)} invalid={!!form.errors.content} minHeight={280} />
				{form.errors.content && <p className="-mt-3 text-[14.5px] font-semibold text-rust">{form.errors.content}</p>}
				<div className="grid gap-4 sm:grid-cols-2">
					<Field label="FAQ category" required>
						{({ id }) => (
							<Select id={id} value={form.data.category_id} onChange={event => form.setData("category_id", event.target.value)}>
								{categories.map(c => (
									<option key={c.id} value={c.id}>
										{c.name}
									</option>
								))}
							</Select>
						)}
					</Field>
					<Field label="Status" required>
						{({ id }) => (
							<Select id={id} value={form.data.status} onChange={event => form.setData("status", event.target.value as "draft" | "published")}>
								<option value="draft">Draft</option>
								<option value="published">Published</option>
							</Select>
						)}
					</Field>
				</div>
				<fieldset>
					<legend className="font-bold">Shown to</legend>
					<div className="mt-2 grid gap-1">
						{audiences.map(audience => (
							<label key={audience.value} className="flex min-h-10 cursor-pointer items-center gap-3">
								<input
									type="checkbox"
									className="size-5 accent-ink"
									checked={form.data.audiences.includes(audience.value)}
									onChange={event => form.setData("audiences", event.target.checked ? [...form.data.audiences, audience.value] : form.data.audiences.filter(value => value !== audience.value))}
								/>
								{audience.label}
							</label>
						))}
					</div>
				</fieldset>
			</div>
			<FormActions processing={form.processing} onCancel={() => go("faq")} />
		</form>
	);
}

/* Pages --------------------------------------------------------------------- */

function PagesTab({ pages }: { pages: ContentPage[] }) {
	return (
		<>
			<p className="text-[15px] text-ink-muted">Pages with texts the PCT team edits. The home, about and help pages follow the A2 design and are not edited here.</p>
			<ul className="mt-5 divide-y divide-line overflow-hidden rounded-card border border-line bg-white">
				{pages.map(page => (
					<li key={page.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
						<span className="min-w-0">
							<span className="block font-bold">{page.title}</span>
							<span className="text-[14px] text-ink-muted">
								{page.slug}
								{page.updated_at && ` · updated ${formatDate(page.updated_at)}`}
							</span>
						</span>
						<button type="button" onClick={() => go("pages", page.id)} className="font-display font-extrabold text-link">
							Edit<span className="sr-only"> {page.title}</span>
						</button>
					</li>
				))}
			</ul>
		</>
	);
}

function PageForm({ page }: { page: ContentPage }) {
	const form = useForm({ title: page.title, subtitle: page.subtitle ?? "", blocks: page.blocks.length ? page.blocks : [""] });
	const submit = (event: FormEvent) => {
		event.preventDefault();
		form.put(`/admin/content/pages/${page.id}`, { preserveScroll: true });
	};
	return (
		<form onSubmit={submit} noValidate className="max-w-[880px]">
			<EditorHead page title="Edit page" sub={`${page.slug}${page.updated_at ? ` · last updated ${formatDate(page.updated_at)}` : ""}`} />
			<div className="grid gap-5">
				<Field label="Title" required error={form.errors.title}>
					{({ id, invalid }) => <TextInput id={id} value={form.data.title} onChange={event => form.setData("title", event.target.value)} aria-invalid={invalid} className="h-13" />}
				</Field>
				<Field label="Subtitle">{({ id }) => <TextInput id={id} value={form.data.subtitle} onChange={event => form.setData("subtitle", event.target.value)} className="h-13" />}</Field>
				{form.data.blocks.map((block, index) => (
					<div key={index}>
						<RichText label={`Section ${index + 1}`} value={block} onChange={html => form.setData("blocks", form.data.blocks.map((other, i) => (i === index ? html : other)))} minHeight={160} />
						{form.data.blocks.length > 1 && (
							<button type="button" onClick={() => form.setData("blocks", form.data.blocks.filter((_, i) => i !== index))} className="mt-2 font-display text-[14.5px] font-extrabold">
								Remove section {index + 1}
							</button>
						)}
					</div>
				))}
				<Button variant="secondary" size="sm" className="self-start" onClick={() => form.setData("blocks", [...form.data.blocks, ""])}>
					Add a section
				</Button>
			</div>
			<FormActions processing={form.processing} onCancel={() => go("pages")} />
		</form>
	);
}

/* Ambassadors ----------------------------------------------------------------- */

function AmbassadorsTab({ ambassadors }: { ambassadors: Ambassador[] }) {
	const editing = useEditing();
	const [deleting, setDeleting] = useState<Ambassador | null>(null);
	const current = editing === "new" ? null : ambassadors.find(item => item.id === editing) ?? null;
	return (
		<Split
			list={
				<>
					<div className="flex flex-wrap items-center justify-between gap-3">
						<p className="text-[15px] text-ink-muted">{ambassadors.length} ambassadors on the map of the About page.</p>
						<Button onClick={() => go("ambassadors", "new")}>Add ambassador</Button>
					</div>
					<ul className="mt-5 divide-y divide-line overflow-hidden rounded-card border border-line bg-white">
						{ambassadors.map(item => (
							<li key={item.id} className={cn("flex flex-wrap items-center justify-between gap-3 px-5 py-4", item.id === editing && "bg-teal-50")}>
								<span className="min-w-0">
									<span className="block font-bold">{item.name}</span>
									<span className="text-[14px] text-ink-muted">
										{item.place} · {item.description}
									</span>
								</span>
								<RowActions label={item.name} view={`${routes.about}#ambassadors`} onEdit={() => go("ambassadors", item.id)} onDelete={() => setDeleting(item)} />
							</li>
						))}
					</ul>
					{deleting && <ConfirmDelete what={deleting.name} url={`/admin/content/ambassadors/${deleting.id}`} onClose={() => setDeleting(null)} />}
				</>
			}
			editor={editing === null ? <EmptyEditor what="an ambassador" /> : <AmbassadorForm key={editing} item={current} />}
		/>
	);
}

function AmbassadorForm({ item }: { item: Ambassador | null }) {
	const form = useForm({ name: item?.name ?? "", description: item?.description ?? "", place: item?.place ?? "", latitude: item?.latitude ?? "", longitude: item?.longitude ?? "" });
	const submit = (event: FormEvent) => {
		event.preventDefault();
		if (item) form.put(`/admin/content/ambassadors/${item.id}`, { preserveScroll: true });
		else form.post("/admin/content/ambassadors", { preserveScroll: true });
	};
	const input = (key: "name" | "description" | "place" | "latitude" | "longitude", label: string, help?: string) => (
		<Field label={label} required help={help} error={form.errors[key]}>
			{({ id, describedBy, invalid }) => <TextInput id={id} value={form.data[key]} onChange={event => form.setData(key, event.target.value)} aria-describedby={describedBy} aria-invalid={invalid} inputMode={key === "latitude" || key === "longitude" ? "decimal" : undefined} className="h-13" />}
		</Field>
	);
	return (
		<form onSubmit={submit} noValidate>
			<EditorHead title={item ? "Edit ambassador" : "New ambassador"} sub={item?.name} />
			<div className="grid gap-5">
				{input("name", "Name")}
				{input("description", "Description", "Role and institution, as shown on the map card.")}
				{input("place", "Place", "City, country, e.g. “Utrecht, Netherlands”.")}
				<div className="grid gap-4 sm:grid-cols-2">
					{input("latitude", "Latitude", "e.g. 52.091")}
					{input("longitude", "Longitude", "e.g. 5.122")}
				</div>
				<p className="text-[14px] text-ink-muted">
					Find the coordinates on{" "}
					<a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" className="font-bold text-link underline underline-offset-3">
						OpenStreetMap
					</a>
					: right-click the place and choose “Show address”.
				</p>
			</div>
			<FormActions processing={form.processing} onCancel={() => go("ambassadors")} />
		</form>
	);
}
