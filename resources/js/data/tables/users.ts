import { TTable, TTableCellName } from "../../typings/tables";
import { idCell, nameCell } from "./cells/protocol";
import {
	createdAtCell,
	emailCell,
	firstNameCell,
	lastNameCell,
	protocolsCell
} from "./cells/users";

export const usersTable: TTable = {
	headers: [
		TTableCellName.ID,
		TTableCellName.FirstName,
		TTableCellName.LastName,
		TTableCellName.Email,
		TTableCellName.CreatedAt,
		TTableCellName.Protocols
	],
	cells: [idCell, firstNameCell, lastNameCell, emailCell, createdAtCell, protocolsCell]
};
