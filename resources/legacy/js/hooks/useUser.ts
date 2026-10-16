import React from "react";
import { userStoreContext } from "../contexts/UserContext";
import { UserStore } from "../stores/UserStore";

export const useUser = (): UserStore => React.useContext(userStoreContext);
