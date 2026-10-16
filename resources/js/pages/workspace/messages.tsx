import { Link, router, useForm } from "@inertiajs/react";
import { ArrowLeft, ArrowRight, Check, CheckCheck, Lock, Paperclip, Search, X } from "lucide-react";
import { type FormEvent, Fragment, useEffect, useMemo, useRef, useState } from "react";
import { EmbargoBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar, Note } from "@/components/ui/Content";
import { Switch } from "@/components/ui/Form";
import { Menu } from "@/components/ui/Interactive";
import { WorkspaceLayout } from "@/layouts/Layouts";
import { cn } from "@/lib/cn";
import { dayKey, formatDate, formatShort, formatTime, formatWeekday } from "@/lib/dates";
import { routes } from "@/lib/routes";
import { type Conversation, conversationContext, ProtocolChip } from "@/components/workspace/Conversation";

type ThreadMessage = { id: number; mine: boolean; author: string; initials: string; text: string; at: string; attachment: { name: string; url: string } | null; read: string | null };

type OpenConversation = Conversation & {
	role: string | null;
	blocked: boolean;
	can_block: boolean;
	protocol: (NonNullable<Conversation["protocol"]> & { embargo_until: string | null; viewable: boolean }) | null;
	messages: ThreadMessage[];
};

type Props = {
	conversations: Conversation[];
	archived: Conversation[];
	conversation: OpenConversation | null;
	notifications: boolean;
	myProtocols: { id: number; pct_id: string; title: string }[];
};

type Filter = "all" | "unread" | "researchers" | "team" | "archived";

export default function Messages({ conversations, archived, conversation, notifications, myProtocols }: Props) {
	const unread = conversations.reduce((sum, item) => sum + (item.unread ? 1 : 0), 0);

	return (
		<WorkspaceLayout title={conversation ? `${conversation.name} · Messages` : "Messages"} slimFooter>
			<div className="container-page pt-10 pb-14 lg:pt-12 lg:pb-18">
				<div className={cn("flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between", conversation && "max-lg:hidden")}>
					<div className="max-w-[640px]">
						<p className="eyebrow">Inbox · {unread} unread</p>
						<h1 className="mt-3 text-5xl leading-[1.05] font-extrabold tracking-[-0.04em] sm:text-[52px]">Messages</h1>
						<p className="mt-3 text-[17px] leading-normal text-ink-muted">All conversations you take part in: with the PCT team, and with researchers who asked about one of your protocols.</p>
					</div>
					<div className="rounded-full bg-white px-5 py-3 shadow-[inset_0_0_0_1px_var(--color-line)] lg:shrink-0">
						<Switch checked={notifications} onChange={enabled => router.post("/dashboard/messages/notifications", { enabled }, { preserveScroll: true })} label={<span className="font-semibold">Email me about new messages</span>} />
					</div>
				</div>

				<div className="mt-8 grid overflow-hidden rounded-panel border border-line bg-white lg:min-h-[720px] lg:grid-cols-[384px_minmax(0,1fr)]">
					<ConversationList conversations={conversations} archived={archived} selected={conversation?.id ?? null} hidden={!!conversation} />
					{conversation ? (
						<ConversationView key={conversation.id} conversation={conversation} archived={archived.some(item => item.id === conversation.id)} myProtocols={myProtocols} />
					) : (
						<div className="hidden flex-col items-center justify-center border-l border-line px-10 text-center lg:flex">
							<p className="text-2xl font-extrabold tracking-[-0.02em]">Choose a conversation</p>
							<p className="mt-2 max-w-sm text-ink-muted">Researchers reach you through “Ask question to author” on your published protocols. The PCT team writes here about your registrations.</p>
						</div>
					)}
				</div>
			</div>
		</WorkspaceLayout>
	);
}

/* -------------------------------------------------------------------------- */

function ConversationList({ conversations, archived, selected, hidden }: { conversations: Conversation[]; archived: Conversation[]; selected: number | null; hidden: boolean }) {
	const [filter, setFilter] = useState<Filter>("all");
	const [query, setQuery] = useState("");

	const filters: { key: Filter; label: string; count?: number; peach?: boolean }[] = [
		{ key: "all", label: "All", count: conversations.length },
		{ key: "unread", label: "Unread", count: conversations.filter(item => item.unread).length, peach: true },
		{ key: "researchers", label: "Researchers" },
		{ key: "team", label: "PCT team" },
		...(archived.length ? [{ key: "archived" as const, label: "Archived", count: archived.length }] : [])
	];

	const shown = useMemo(() => {
		const source = filter === "archived" ? archived : conversations;
		const words = query.toLowerCase().split(/\s+/).filter(Boolean);
		return source.filter(item => {
			if (filter === "unread" && !item.unread) return false;
			if (filter === "researchers" && item.kind !== "question") return false;
			if (filter === "team" && item.kind === "question") return false;
			const haystack = [item.name, item.affiliation, item.subject, item.excerpt, item.protocol?.pct_id, item.protocol?.title].join(" ").toLowerCase();
			return words.every(word => haystack.includes(word));
		});
	}, [conversations, archived, filter, query]);

	return (
		<section aria-labelledby="conversations-title" className={cn("flex flex-col", hidden && "max-lg:hidden")}>
			<div className="px-5 pt-6 sm:px-6">
				<h2 id="conversations-title" className="text-[22px] font-extrabold tracking-[-0.015em]">
					Conversations
				</h2>
				<label className="relative mt-4 block">
					<span className="sr-only">Search conversations</span>
					<Search size={18} strokeWidth={2.2} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4.5 -translate-y-1/2 text-teal-500" />
					<input
						type="search"
						value={query}
						onChange={event => setQuery(event.target.value)}
						placeholder="Search by name, PCT ID or text"
						className="h-12 w-full rounded-full bg-white pr-4 pl-11.5 text-[15.5px] shadow-[inset_0_0_0_1.5px_var(--color-line-strong)] placeholder:text-ink-subtle focus:shadow-[inset_0_0_0_2px_var(--color-teal-500)] focus:outline-none"
					/>
				</label>
				<div role="group" aria-label="Filter conversations" className="mt-3.5 flex flex-wrap gap-1.5">
					{filters.map(item => (
						<button
							key={item.key}
							type="button"
							aria-pressed={filter === item.key}
							onClick={() => setFilter(item.key)}
							className={cn("inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[15px] font-bold", filter === item.key ? "bg-ink text-white" : "hover:bg-mist")}
						>
							{item.label}
							{item.count !== undefined && item.count > 0 && (
								<span className={cn("flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11.5px] font-extrabold", filter === item.key ? "bg-white/20" : item.peach ? "bg-peach-300 text-ink" : "text-ink-muted")}>{item.count}</span>
							)}
						</button>
					))}
				</div>
			</div>

			<ul className="mt-3 flex-1 px-2.5 pb-3">
				{shown.length === 0 && <li className="px-4 py-8 text-center text-[15px] text-ink-muted">{query ? "No conversation matches." : filter === "unread" ? "Nothing unread." : "No conversations yet."}</li>}
				{shown.map(item => {
					const active = item.id === selected;
					const context = conversationContext(item);
					return (
						<li key={item.id}>
							<Link
								href={routes.conversation(item.id)}
								preserveScroll
								aria-current={active ? "page" : undefined}
								className={cn("flex gap-3.5 rounded-2xl px-3.5 py-3.5 text-ink hover:text-ink", active ? "bg-teal-50" : "hover:bg-mist")}
							>
								<Avatar initials={item.initials} size={42} tone={active ? "teal" : "teal"} />
								<span className="min-w-0 flex-1">
									<span className="flex items-start justify-between gap-2">
										<strong className="truncate text-[15.5px]">{item.name}</strong>
										<span className="flex shrink-0 items-center gap-1.5 text-[13px] text-ink-muted">
											{item.at && formatShort(item.at)}
											{item.unread > 0 && (
												<span className="size-2 rounded-full bg-peach-300">
													<span className="sr-only">, unread</span>
												</span>
											)}
										</span>
									</span>
									{context && <span className={cn("block truncate text-[14.5px]", item.unread ? "font-bold" : "font-semibold")}>{context}</span>}
									{item.excerpt && (
										<span className="mt-0.5 block truncate text-[14px] text-ink-muted">
											{item.from_me && "You: "}
											{item.excerpt}
										</span>
									)}
									{item.protocol && (
										<span className="mt-1.5 block">
											<ProtocolChip protocol={item.protocol} />
										</span>
									)}
								</span>
							</Link>
						</li>
					);
				})}
			</ul>
			<p className="border-t border-line px-6 py-4 text-[13.5px] leading-normal text-ink-muted">Your email address is never shared. Researchers reach you through “Ask question to author” on a protocol.</p>
		</section>
	);
}

/* -------------------------------------------------------------------------- */

function ConversationView({ conversation, archived, myProtocols }: { conversation: OpenConversation; archived: boolean; myProtocols: Props["myProtocols"] }) {
	const thread = useRef<HTMLDivElement>(null);
	useEffect(() => {
		thread.current?.scrollTo({ top: thread.current.scrollHeight });
	}, [conversation.messages.length]);

	const subtitle =
		conversation.kind === "question"
			? [conversation.role, conversation.affiliation].filter(Boolean).join(", ")
			: conversation.kind === "feedback"
				? "Questions about a feedback point stay attached to the field"
				: conversation.subject ?? "Conversation with the PCT team";

	const days = groupByDay(conversation.messages);

	return (
		<section aria-labelledby="conversation-title" className="flex min-h-[640px] flex-col lg:border-l lg:border-line">
			<div className="border-b border-line px-5 py-5 sm:px-7">
				<Link href={routes.messages} className="mb-3 inline-flex items-center gap-2 font-display font-extrabold lg:hidden">
					<ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />
					All conversations
				</Link>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="flex items-start gap-3.5">
						<Avatar initials={conversation.initials} size={48} />
						<div>
							<h2 id="conversation-title" className="text-[22px] leading-tight font-extrabold tracking-[-0.015em]">
								{conversation.name}
							</h2>
							{subtitle && <p className="mt-0.5 text-[14.5px] text-ink-muted">{subtitle}</p>}
						</div>
					</div>
					<div className="flex shrink-0 flex-wrap gap-2">
						<Button variant="secondary" size="sm" onClick={() => router.post(`/dashboard/messages/${conversation.id}/unread`)}>
							Mark as unread
						</Button>
						<Button variant="secondary" size="sm" onClick={() => router.post(`/dashboard/messages/${conversation.id}/archive`, { archived: !archived })}>
							{archived ? "Move to inbox" : "Archive"}
						</Button>
						{conversation.can_block && (
							<Menu
								direction="down"
								items={[{ label: conversation.blocked ? "Reopen this conversation" : "Close this conversation", onSelect: () => router.post(`/dashboard/messages/${conversation.id}/block`, { blocked: !conversation.blocked }, { preserveScroll: true }) }]}
								footer="A closed conversation keeps its messages, but nobody can reply."
							/>
						)}
					</div>
				</div>
			</div>

			{conversation.protocol && (
				<div className="mx-4 mt-4 flex flex-col gap-3 rounded-card bg-teal-50 px-5 py-4 sm:mx-7 sm:flex-row sm:items-center sm:justify-between">
					<div className="min-w-0">
						<p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px] text-ink-muted">
							{conversation.protocol.pct_id && <span className="pct-id text-[15px] text-ink">{conversation.protocol.pct_id}</span>}
							{conversation.kind === "question" && <span>{conversation.asked_by_me ? "You asked via “Ask question to author”" : "Asked via “Ask question to author”"}</span>}
							{conversation.kind === "feedback" && conversation.field_key && <span>{conversationContext(conversation)}</span>}
						</p>
						<p className="mt-0.5 truncate font-bold">{conversation.protocol.title}</p>
					</div>
					<div className="flex shrink-0 items-center gap-3">
						{conversation.protocol.embargo_until && <EmbargoBadge until={formatDate(conversation.protocol.embargo_until)} />}
						{conversation.kind === "feedback" && conversation.protocol.status === "rejected" ? (
							<a href={routes.feedback(conversation.protocol.id)} className="inline-flex items-center gap-1.5 font-display font-extrabold text-link">
								Open feedback
								<ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
							</a>
						) : (
							conversation.protocol.viewable && (
								<a href={routes.protocol(conversation.protocol.id)} className="inline-flex items-center gap-1.5 font-display font-extrabold text-link">
									View protocol
									<ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
								</a>
							)
						)}
					</div>
				</div>
			)}

			<div ref={thread} className="flex-1 overflow-y-auto px-4 py-5 sm:px-7 lg:max-h-[560px]" tabIndex={-1}>
				{days.map(([day, messages]) => (
					<Fragment key={day}>
						<p className="my-4 flex items-center gap-4 text-center">
							<span aria-hidden="true" className="h-px flex-1 bg-line" />
							<span className="eyebrow text-xs">{dayKey(new Date()) === day ? "Today" : formatWeekday(messages[0].at)}</span>
							<span aria-hidden="true" className="h-px flex-1 bg-line" />
						</p>
						<ol className="grid gap-4">
							{messages.map(message => (
								<li key={message.id} className={cn("flex items-start gap-3", message.mine && "flex-row-reverse")}>
									<Avatar initials={message.initials} size={38} />
									<div className={cn("max-w-[640px]", message.mine && "text-right")}>
										<div className={cn("rounded-card px-4.5 py-3.5 text-left", message.mine ? "bg-teal-50" : "bg-white shadow-[inset_0_0_0_1px_var(--color-line)]")}>
											<p className="text-[13px] text-ink-muted">
												<strong className="text-ink">{message.author}</strong> · {formatTime(message.at)}
											</p>
											{message.text && <p className="mt-1 text-[16px] leading-normal whitespace-pre-line">{message.text}</p>}
											{message.attachment && (
												<a href={message.attachment.url} className="mt-2 inline-flex items-center gap-2 rounded-input bg-white px-3 py-2 text-[14.5px] font-bold text-ink shadow-[inset_0_0_0_1px_var(--color-line)] hover:text-link">
													<Paperclip size={15} strokeWidth={2.2} aria-hidden="true" />
													{message.attachment.name}
												</a>
											)}
										</div>
										{message.read && message.id === conversation.messages.filter(item => item.mine).at(-1)?.id && (
											<p className="mt-1.5 inline-flex items-center gap-1.5 text-[13px] text-ink-muted">
												<CheckCheck size={14} strokeWidth={2.4} aria-hidden="true" />
												Read {formatShort(message.read).replace(/^\d{2}:\d{2}$/, "today")}
											</p>
										)}
									</div>
								</li>
							))}
						</ol>
					</Fragment>
				))}
			</div>

			{conversation.blocked ? (
				<div className="border-t border-line px-5 py-5 sm:px-7">
					<Note tone="mist" icon={<Lock size={16} strokeWidth={2.2} className="mt-1 shrink-0 text-ink-muted" aria-hidden="true" />}>
						This conversation is closed. Nobody can reply to it.
					</Note>
				</div>
			) : (
				<Composer conversation={conversation} myProtocols={myProtocols} />
			)}
		</section>
	);
}

function groupByDay(messages: ThreadMessage[]) {
	const days = new Map<string, ThreadMessage[]>();
	messages.forEach(message => days.set(dayKey(message.at), [...(days.get(dayKey(message.at)) ?? []), message]));
	return [...days.entries()];
}

function Composer({ conversation, myProtocols }: { conversation: OpenConversation; myProtocols: Props["myProtocols"] }) {
	const draftKey = `pct-draft-${conversation.id}`;
	const form = useForm<{ text: string; attachment: File | null }>({ text: "", attachment: null });
	const [draftSaved, setDraftSaved] = useState(false);
	const textarea = useRef<HTMLTextAreaElement>(null);
	const file = useRef<HTMLInputElement>(null);

	// Unsent replies survive a reload (this browser only).
	useEffect(() => {
		try {
			const saved = window.localStorage.getItem(draftKey);
			if (saved) form.setData("text", saved);
		} catch {}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [draftKey]);
	useEffect(() => {
		const timer = window.setTimeout(() => {
			try {
				if (form.data.text) window.localStorage.setItem(draftKey, form.data.text);
				else window.localStorage.removeItem(draftKey);
				setDraftSaved(!!form.data.text);
			} catch {}
		}, 600);
		return () => window.clearTimeout(timer);
	}, [form.data.text, draftKey]);

	const insert = (text: string) => {
		const el = textarea.current;
		const at = el?.selectionStart ?? form.data.text.length;
		form.setData("text", `${form.data.text.slice(0, at)}${text}${form.data.text.slice(at)}`);
		requestAnimationFrame(() => el?.focus());
	};

	const send = (event: FormEvent) => {
		event.preventDefault();
		form.post(`/dashboard/messages/${conversation.id}`, {
			forceFormData: true,
			preserveScroll: true,
			onSuccess: () => {
				form.reset();
				if (file.current) file.current.value = "";
				try {
					window.localStorage.removeItem(draftKey);
				} catch {}
			}
		});
	};

	return (
		<form onSubmit={send} className="border-t border-line px-4 pt-4 pb-5 sm:px-7">
			<label htmlFor="reply" className="sr-only">
				Your reply
			</label>
			<textarea
				id="reply"
				ref={textarea}
				rows={3}
				value={form.data.text}
				onChange={event => form.setData("text", event.target.value)}
				placeholder={conversation.kind === "question" ? `Reply to ${conversation.name}` : "Write to the PCT team"}
				className="w-full rounded-input border-[1.5px] border-ink-subtle px-4 py-3 text-[16px] focus:border-link focus:shadow-[0_0_0_4px_var(--color-blue-100)] focus:outline-none"
			/>
			{(form.errors.text || form.errors.attachment) && <p className="mt-2 text-[14.5px] font-semibold text-rust">{form.errors.text ?? form.errors.attachment}</p>}
			<div className="mt-3 flex flex-wrap items-center gap-2">
				<label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full px-3.5 font-display text-[15px] font-extrabold hover:bg-teal-50">
					<Paperclip size={16} strokeWidth={2.4} aria-hidden="true" />
					Attach file
					<input ref={file} type="file" className="sr-only" onChange={event => form.setData("attachment", event.target.files?.[0] ?? null)} accept=".pdf,.png,.jpg,.jpeg,.gif,.doc,.docx,.xls,.xlsx,.csv,.txt" />
				</label>
				{myProtocols.length > 0 && (
					<Menu
						direction="up"
						align="left"
						label="Insert protocol link"
						chevron={false}
						className="[&>button]:shadow-none"
						items={myProtocols.map(protocol => ({
							label: (
								<span className="truncate">
									<span className="pct-id">{protocol.pct_id}</span> · {protocol.title}
								</span>
							),
							onSelect: () => insert(`${protocol.pct_id} (${window.location.origin}${routes.protocol(protocol.id)})`)
						}))}
					/>
				)}
				{form.data.attachment && (
					<span className="inline-flex h-9 items-center gap-2 rounded-full bg-mist pr-1 pl-3 text-[14px] font-bold">
						{form.data.attachment.name}
						<button
							type="button"
							aria-label="Remove attachment"
							className="inline-flex size-7 items-center justify-center rounded-full hover:bg-white"
							onClick={() => {
								form.setData("attachment", null);
								if (file.current) file.current.value = "";
							}}
						>
							<X size={14} strokeWidth={2.4} aria-hidden="true" />
						</button>
					</span>
				)}
				<span className="ml-auto flex items-center gap-4">
					{draftSaved && (
						<span className="inline-flex items-center gap-1.5 text-[14px] text-ink-muted">
							<Check size={14} strokeWidth={2.6} aria-hidden="true" />
							Draft saved
						</span>
					)}
					<Button type="submit" disabled={form.processing || (!form.data.text.trim() && !form.data.attachment)}>
						Send reply
					</Button>
				</span>
			</div>
		</form>
	);
}
