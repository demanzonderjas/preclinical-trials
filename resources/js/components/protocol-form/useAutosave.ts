import { useCallback, useEffect, useRef, useState } from "react";
import { HttpError, request } from "@/lib/http";
import { routes } from "@/lib/routes";
import type { Values } from "./Fields";

export type SaveState = { state: "idle" | "saving" | "saved" | "error"; at?: string };
type Saved = { id: number; saved_at: string };

/**
 * The answers of a protocol, saved automatically 1.2 s after the last change (F5). Only
 * changed answers are sent; the first save of a new protocol creates the draft and moves
 * the URL to its edit page. With `enabled` off (amendments) changes stay local.
 */
export function useAutosave({ id: initialId, values: initial, savedAt, enabled }: { id: number | null; values: Values; savedAt?: string; enabled: boolean }) {
	const [values, setValues] = useState<Values>(initial);
	const [id, setId] = useState(initialId);
	const [save, setSave] = useState<SaveState>(savedAt ? { state: "saved", at: savedAt } : { state: "idle" });

	const valuesRef = useRef(values);
	const dirty = useRef(new Set<string>());
	const idRef = useRef(id);
	const inFlight = useRef<Promise<void> | null>(null);
	const timer = useRef<number | undefined>(undefined);

	const flush = useCallback(async (): Promise<void> => {
		window.clearTimeout(timer.current);
		if (!enabled) return;
		if (inFlight.current) await inFlight.current;
		if (!dirty.current.size) return;

		const keys = [...dirty.current];
		dirty.current.clear();
		const changed = Object.fromEntries(keys.map(key => [key, valuesRef.current[key] ?? null]));
		setSave({ state: "saving" });

		inFlight.current = (async () => {
			try {
				const saved = idRef.current
					? await request<Saved>("PUT", `/dashboard/protocols/${idRef.current}/answers`, { values: changed })
					: await request<Saved>("POST", "/dashboard/protocols", { values: changed });
				if (!idRef.current) {
					idRef.current = saved.id;
					setId(saved.id);
					window.history.replaceState(window.history.state, "", `${routes.editProtocol(saved.id)}${window.location.search}`);
				}
				setSave({ state: "saved", at: saved.saved_at });
			} catch (error) {
				keys.forEach(key => dirty.current.add(key));
				setSave({ state: "error" });
				// An expired session or CSRF token: reload to get a fresh one.
				if (error instanceof HttpError && error.status === 419) window.location.reload();
			} finally {
				inFlight.current = null;
			}
		})();
		await inFlight.current;
	}, [enabled]);

	const set = useCallback(
		(key: string, value: unknown) => {
			setValues(current => {
				const next = { ...current, [key]: value };
				valuesRef.current = next;
				return next;
			});
			dirty.current.add(key);
			if (enabled) {
				window.clearTimeout(timer.current);
				timer.current = window.setTimeout(() => void flush(), 1200);
			}
		},
		[enabled, flush]
	);

	// Warn before leaving with answers that are not saved yet.
	useEffect(() => {
		const warn = (event: BeforeUnloadEvent) => {
			if (enabled && (dirty.current.size || inFlight.current)) event.preventDefault();
		};
		window.addEventListener("beforeunload", warn);
		return () => window.removeEventListener("beforeunload", warn);
	}, [enabled]);

	const uploadImage = useCallback(
		async (file: File) => {
			if (!idRef.current) {
				// Images belong to a protocol, so save the draft first.
				dirty.current.add("title");
				await flush();
			}
			const body = new FormData();
			body.append("image", file);
			return (await request<{ filename: string }>("POST", `/dashboard/protocols/${idRef.current}/images`, body)).filename;
		},
		[flush]
	);

	return { values, set, flush, save, id, uploadImage };
}
