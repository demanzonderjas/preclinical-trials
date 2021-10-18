import React from "react";
import { translationStoreContext } from "../contexts/TranslationContext";

export const useTranslationStore = () => React.useContext(translationStoreContext);
