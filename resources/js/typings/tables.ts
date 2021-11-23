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
	Action = "action"
}
