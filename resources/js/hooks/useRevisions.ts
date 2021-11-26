import React from "react";
import { revisionStoreContext } from "../contexts/RevisionStoreContext";
import { RevisionStore } from "../stores/RevisionStore";

export const useRevisions = (): RevisionStore => React.useContext(revisionStoreContext);
