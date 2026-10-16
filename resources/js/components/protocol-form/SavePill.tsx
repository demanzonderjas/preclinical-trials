import { CloudOff, CloudUpload, LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { formatTime } from "@/lib/dates";
import type { SaveState } from "./useAutosave";

/** "All changes saved automatically · 14:32", or what is happening instead. */
export function SavePill({ save, autosaves }: { save: SaveState; autosaves: boolean }) {
	const content: Record<SaveState["state"], ReactNode> = {
		idle: autosaves ? "Saved automatically once you start typing" : "Changes are saved when you submit the amendment",
		saving: (
			<>
				<LoaderCircle size={16} strokeWidth={2.2} className="animate-spin text-teal-500" aria-hidden="true" />
				Saving…
			</>
		),
		saved: (
			<>
				<CloudUpload size={16} strokeWidth={2.2} className="text-teal-500" aria-hidden="true" />
				All changes saved automatically{save.at ? ` · ${formatTime(save.at)}` : ""}
			</>
		),
		error: (
			<>
				<CloudOff size={16} strokeWidth={2.2} className="text-rust" aria-hidden="true" />
				Not saved yet. We keep trying when you change something
			</>
		)
	};
	return (
		<p role="status" className={cn("inline-flex h-8 items-center gap-2 rounded-full bg-white px-3.5 text-[14px] font-semibold text-ink", save.state === "error" && "bg-peach-100")}>
			{autosaves || save.state === "idle" ? content[save.state] : content.idle}
		</p>
	);
}
