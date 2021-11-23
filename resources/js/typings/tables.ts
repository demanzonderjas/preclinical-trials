import { TFormFieldName } from "./forms";

export type TTable = {
	headers: TTableCellName[];
	cells: TTableCell[];
};

export type TTableCell = {
	id: TTableCellName;
	Component: React.FC<any>;
	value: string;
	synonym?: TFormFieldName | string;
};

export enum TTableCellName {
	Title = "title",
	Status = "status",
	LastUpdated = "last_updated",
	StudyCentre = "study_centre",
	Action = "action"
}

export type TFilter = {
	key?: TFormFieldName;
	value: string;
};
