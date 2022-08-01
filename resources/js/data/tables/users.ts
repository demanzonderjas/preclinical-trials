import { TTable, TTableCellName } from "../../typings/tables";
import { idCell, nameCell } from "./cells/protocol";
import { emailCell, firstNameCell, lastNameCell, protocolsCell } from "./cells/users";

export const usersTable: TTable = {
	headers: [
		TTableCellName.ID,
		TTableCellName.FirstName,
		TTableCellName.LastName,
		TTableCellName.Email,
		TTableCellName.Protocols
	],
	cells: [idCell, firstNameCell, lastNameCell, emailCell, protocolsCell]
};
