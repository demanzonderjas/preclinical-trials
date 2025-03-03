import { DateCell } from "../../../components/tables/DateCell";
import { ProtocolsCell } from "../../../components/tables/ProtocolsCell";
import { TTableCell, TTableCellName } from "../../../typings/tables";
import { titleCell } from "./protocol";

export const firstNameCell: TTableCell = {
	...titleCell,
	id: TTableCellName.FirstName
};

export const lastNameCell: TTableCell = {
	...titleCell,
	id: TTableCellName.LastName
};

export const emailCell: TTableCell = {
	...titleCell,
	id: TTableCellName.Email
};

export const createdAtCell: TTableCell = {
	...titleCell,
	id: TTableCellName.CreatedAt,
	Component: DateCell
};

export const protocolsCell: TTableCell = {
	...titleCell,
	id: TTableCellName.Protocols,
	Component: ProtocolsCell
};
