import { TTable, TTableCellName } from "../../typings/tables";
import { actionCell, editCell, lastUpdatedAtCell, statusCell, titleCell } from "./cells/protocol";

export const manageProtocolsTable: TTable = {
	headers: ["Title", "Last Updated", "Status", "Action"],
	cells: [titleCell, lastUpdatedAtCell, statusCell, actionCell]
};
