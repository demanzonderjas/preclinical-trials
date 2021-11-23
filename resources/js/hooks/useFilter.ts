import React from "react";
import { filterStoreContext } from "../contexts/FilterStoreContext";
import { FilterStore } from "../stores/FilterStore";

export const useFilter = (): FilterStore => React.useContext(filterStoreContext);
