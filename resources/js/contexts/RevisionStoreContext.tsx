import { useLocalObservable } from "mobx-react-lite";
import React, { createContext } from "react";
import { RevisionStore } from "../stores/RevisionStore";

export const revisionStoreContext = createContext<RevisionStore>({} as RevisionStore);

type Props = {
	children?: React.ReactNode;
	store: RevisionStore;
};

export const RevisionStoreProvider: React.FC<Props> = ({ store, children }) => {
	if (!store) {
		return <>{children}</>;
	}
	const storeHook = useLocalObservable(() => store);

	return (
		<revisionStoreContext.Provider value={storeHook}>{children}</revisionStoreContext.Provider>
	);
};
