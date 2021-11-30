import React from "react";
import { useLocalObservable } from "mobx-react";
import { ModalStore } from "../stores/ModalStore";

export const modalStoreContext = React.createContext<ModalStore | null>(null);

type Props = {
	children?: React.ReactNode;
	store: ModalStore;
};

export const ModalStoreProvider: React.FC<Props> = ({ store, children }) => {
	const storeHook = useLocalObservable(() => store);

	return <modalStoreContext.Provider value={storeHook}>{children}</modalStoreContext.Provider>;
};

export default ModalStoreProvider;
