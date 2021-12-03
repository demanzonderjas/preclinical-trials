import React from "react";
import { protocolStoreContext } from "../contexts/ProtocolContext";
import { ProtocolStore } from "../stores/ProtocolStore";

export const useProtocol = (): ProtocolStore => React.useContext(protocolStoreContext);
