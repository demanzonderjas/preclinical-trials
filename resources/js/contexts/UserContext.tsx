import { useLocalStore } from "mobx-react-lite";
import React, { createContext } from "react";
import { FilterStore } from "../stores/FilterStore";
import { UserStore } from "../stores/UserStore";

export const userStoreContext = createContext<UserStore>({} as UserStore);

type Props = {
	children?: React.ReactNode;
	store: UserStore;
};

export const UserStoreProvider: React.FC<Props> = ({ store, children }) => {
	const storeHook = useLocalStore(() => store);

	return <userStoreContext.Provider value={storeHook}>{children}</userStoreContext.Provider>;
};
