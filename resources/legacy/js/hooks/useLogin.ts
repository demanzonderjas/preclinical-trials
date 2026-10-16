import { getMeta } from "../utils/api";
import { useUser } from "./useUser";

export function useIsLoggedIn() {
	const { user } = useUser();

	return !!user;
}
