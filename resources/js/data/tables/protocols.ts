import { TTable, TTableCellName } from "../../typings/tables";
import {
	actionCell,
	editCell,
	lastUpdatedAtCell,
	statusCell,
	studyCentreCell,
	titleCell
} from "./cells/protocol";

export const manageProtocolsTable: TTable = {
	headers: [
		TTableCellName.Title,
		TTableCellName.LastUpdated,
		TTableCellName.Status,
		TTableCellName.Action
	],
	cells: [titleCell, lastUpdatedAtCell, statusCell, actionCell]
};

export const searchProtocolsTable: TTable = {
	headers: [TTableCellName.Title, TTableCellName.StudyCentre, TTableCellName.Status],
	cells: [titleCell, studyCentreCell, statusCell]
};
