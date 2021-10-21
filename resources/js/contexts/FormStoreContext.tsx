import { createContext } from "react";
import { FormStore } from "../stores/FormStore";

export const FormStoreContext = createContext<FormStore>({} as FormStore);
