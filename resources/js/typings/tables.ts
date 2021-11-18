import { TFormFieldName } from "./forms";

export type TTable = {
	headers: string[];
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
