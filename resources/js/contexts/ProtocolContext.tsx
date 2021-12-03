import { useLocalObservable } from "mobx-react-lite";
import React, { createContext } from "react";
import { ProtocolStore } from "../stores/ProtocolStore";
import { UserStore } from "../stores/UserStore";

export const protocolStoreContext = createContext<ProtocolStore>({} as ProtocolStore);

type Props = {
	children?: React.ReactNode;
	store: ProtocolStore;
};

export const ProtocolStoreProvider: React.FC<Props> = ({ store, children }) => {
	const storeHook = useLocalObservable(() => store);

	return (
		<protocolStoreContext.Provider value={storeHook}>{children}</protocolStoreContext.Provider>
	);
};
