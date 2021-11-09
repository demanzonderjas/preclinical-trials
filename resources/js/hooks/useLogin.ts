import { getMeta } from "../utils/api";

export function useIsLoggedIn() {
	const sessionId = getMeta("session-id");

	return !!sessionId;
}
