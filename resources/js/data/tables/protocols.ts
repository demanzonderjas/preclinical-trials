import { TTable, TTableCellName } from "../../typings/tables";
import { actionCell, editCell, lastUpdatedAtCell, statusCell, titleCell } from "./cells/protocol";

export const manageProtocolsTable: TTable = {
	headers: [
		TTableCellName.Title,
		TTableCellName.LastUpdated,
		TTableCellName.Status,
		TTableCellName.Action
	],
	cells: [titleCell, lastUpdatedAtCell, statusCell, actionCell]
};
