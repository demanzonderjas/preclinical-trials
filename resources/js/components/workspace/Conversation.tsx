import type { ProtocolStatus } from "@/components/ui/Badge";
import { fieldLabel } from "@/lib/workspace";

/** A conversation as listed on the dashboard and in Messages (Inbox::summary). */
export type Conversation = {
	id: number;
	kind: "question" | "team" | "feedback";
	name: string;
	initials: string;
	affiliation: string | null;
	subject: string | null;
	field_key: string | null;
	protocol: { id: number; pct_id: string | null; title: string; status: ProtocolStatus } | null;
	asked_by_me: boolean;
	excerpt: string | null;
	from_me: boolean;
	at: string | null;
	unread: number;
};

/** A protocol title cut at a word, for chips and short lines. */
export const shortTitle = (title: string | null, length = 40) => {
	if (!title) return "Untitled draft";
	return title.length > length ? `${title.slice(0, length).replace(/\s+\S*$/, "")}…` : title;
};

const statusWord: Record<ProtocolStatus, string> = {
	draft: "draft",
	submitted_for_publication: "submitted",
	resubmitted_for_publication: "resubmitted",
	rejected: "needs changes",
	published: "published"
};

/** The protocol chip in conversation lists: the PCT ID, or a short title and status. */
export function ProtocolChip({ protocol }: { protocol: NonNullable<Conversation["protocol"]> }) {
	return (
		<span className="inline-flex h-6 max-w-full items-center truncate rounded-sm bg-mist px-2 text-[13px] font-bold shadow-[inset_0_0_0_1px_var(--color-line)]">
			{protocol.pct_id ? <span className="pct-id">{protocol.pct_id}</span> : `${shortTitle(protocol.title, 18)} · ${statusWord[protocol.status]}`}
		</span>
	);
}

/** "Feedback", a team subject, or the other researcher's institution. */
export function conversationContext(conversation: Conversation) {
	if (conversation.kind === "feedback") return conversation.field_key ? `Feedback · ${fieldLabel(conversation.field_key)}` : "Feedback";
	if (conversation.kind === "team") return conversation.subject;
	return conversation.affiliation;
}
