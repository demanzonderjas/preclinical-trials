import { useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Content";
import { Textarea } from "@/components/ui/Form";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/dates";

export type Message = { id: number; author: string; initials: string; team: boolean; text: string; at: string };

/** The team channel of a protocol, as the PCT team sees it on the review and amendment pages. */
export function ResearcherMessages({ protocolId, messages }: { protocolId: number; messages: Message[] }) {
	const form = useForm({ text: "" });
	return (
		<section aria-labelledby="messages-title" className="rounded-card border border-line bg-white px-5 py-6 sm:px-6">
			<h2 id="messages-title" className="text-xl font-extrabold">
				Messages with the researcher
			</h2>
			{messages.length === 0 ? (
				<p className="mt-2 text-[14.5px] text-ink-muted">No messages about this protocol yet.</p>
			) : (
				<ol className="mt-4 grid gap-4">
					{messages.map(message => (
						<li key={message.id} className="flex gap-3">
							<Avatar initials={message.initials} size={34} tone="teal" />
							<div className="min-w-0">
								<p className="text-[13.5px] text-ink-muted">
									<strong className="text-ink">{message.author}</strong> · {formatDate(message.at)}
								</p>
								<p className={cn("mt-1 rounded-card px-4 py-3 text-[15px] leading-snug whitespace-pre-line", message.team ? "bg-teal-50" : "bg-mist")}>{message.text}</p>
							</div>
						</li>
					))}
				</ol>
			)}
			<form
				className="mt-4"
				onSubmit={event => {
					event.preventDefault();
					form.post(`/admin/protocols/${protocolId}/messages`, { preserveScroll: true, onSuccess: () => form.reset() });
				}}
			>
				<label htmlFor="admin-reply" className="sr-only">
					Write a reply
				</label>
				<Textarea id="admin-reply" rows={2} placeholder="Write a reply" value={form.data.text} onChange={event => form.setData("text", event.target.value)} />
				<div className="mt-2.5 flex justify-end">
					<Button type="submit" variant="secondary" size="sm" disabled={form.processing || !form.data.text.trim()}>
						Send
					</Button>
				</div>
			</form>
		</section>
	);
}
