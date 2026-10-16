import React, { createContext } from "react";
import { RevisionStore } from "../stores/RevisionStore";

export const revisionStoreContext = createContext<RevisionStore | null>(null);

type Props = {
	children?: React.ReactNode;
	store: RevisionStore;
};

export const RevisionStoreProvider: React.FC<Props> = ({ store, children }) => {
	if (!store) {
		return <>{children}</>;
	}

	return (
		<revisionStoreContext.Provider value={store}>{children}</revisionStoreContext.Provider>
	);
};
