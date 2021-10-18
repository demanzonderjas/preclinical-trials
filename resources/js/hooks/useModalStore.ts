import React from "react";
import { modalStoreContext } from "../contexts/ModalContext";

export const useModalStore = () => React.useContext(modalStoreContext);
