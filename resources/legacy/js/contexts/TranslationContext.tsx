import React from "react";
import { useLocalObservable } from "mobx-react";
import { TranslationStore } from "../stores/TranslationStore";

export const translationStoreContext = React.createContext<TranslationStore | null>(null);

type Props = {
	children?: React.ReactNode;
	store: TranslationStore;
};

export const TranslationStoreProvider: React.FC<Props> = ({ store, children }) => {
	const storeHook = useLocalObservable(() => store);

	return (
		<translationStoreContext.Provider value={storeHook}>
			{children}
		</translationStoreContext.Provider>
	);
};

export default TranslationStoreProvider;
