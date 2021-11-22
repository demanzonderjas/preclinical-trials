import { ActionCell, EditCell, ViewCell } from "../../../components/tables/ActionCell";
import { DateCell } from "../../../components/tables/DateCell";
import { TextCell } from "../../../components/tables/TextCell";
import { TFormFieldName } from "../../../typings/forms";
import { TTableCell, TTableCellName } from "../../../typings/tables";

export const titleCell: TTableCell = {
	id: TTableCellName.Title,
	Component: TextCell,
	value: ""
};

export const statusCell: TTableCell = {
	id: TTableCellName.Status,
	Component: TextCell,
	value: ""
};

export const lastUpdatedAtCell: TTableCell = {
	id: TTableCellName.LastUpdated,
	Component: DateCell,
	value: "",
	synonym: "updated_at"
};

export const editCell: TTableCell = {
	id: TTableCellName.Action,
	Component: EditCell,
	value: ""
};

export const viewCell: TTableCell = {
	id: TTableCellName.Action,
	Component: ViewCell,
	value: ""
};

export const actionCell: TTableCell = {
	id: TTableCellName.Action,
	Component: ActionCell,
	value: ""
};
