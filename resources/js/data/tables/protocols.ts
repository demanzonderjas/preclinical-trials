import { TTable, TTableCellName } from "../../typings/tables";
import {
	actionCell,
	armCell,
	cityCell,
	countryCell,
	editCell,
	interventionCell,
	lastUpdatedAtCell,
	nameCell,
	numberCell,
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
	targetOnRowClick: "/database/view-protocol",
	cells: [titleCell, studyCentreCell, statusCell]
};

export const studyArmsTable: TTable = {
	headers: [TTableCellName.Arm, TTableCellName.Number, TTableCellName.Intervention],
	cells: [armCell, numberCell, interventionCell]
};

export const studyCentreTable: TTable = {
	headers: [TTableCellName.Name, TTableCellName.City, TTableCellName.Country],
	cells: [nameCell, cityCell, countryCell]
};
