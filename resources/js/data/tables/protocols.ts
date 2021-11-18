import { TTable, TTableCellName } from "../../typings/tables";
import { editCell, lastUpdatedAtCell, statusCell, titleCell } from "./cells/protocol";

export const manageProtocolsTable: TTable = {
	headers: ["Title", "Last Updated", "Status", "Action"],
	cells: [titleCell, lastUpdatedAtCell, statusCell, editCell]
};
