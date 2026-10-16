import { useLocalObservable } from "mobx-react-lite";
import React, { createContext } from "react";
import { FilterStore } from "../stores/FilterStore";

export const filterStoreContext = createContext<FilterStore>({} as FilterStore);

type Props = {
	children?: React.ReactNode;
	store: FilterStore;
};

export const FilterStoreProvider: React.FC<Props> = ({ store, children }) => {
	const storeHook = useLocalObservable(() => store);

	return <filterStoreContext.Provider value={storeHook}>{children}</filterStoreContext.Provider>;
};
