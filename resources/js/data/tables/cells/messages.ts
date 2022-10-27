import { MessageActionCell } from "../../../components/tables/MessageActionCell";
import { TextCell } from "../../../components/tables/TextCell";
import { TTableCell, TTableCellName } from "../../../typings/tables";

export const messageActionCell: TTableCell = {
	id: TTableCellName.Action,
	Component: MessageActionCell,
	value: ""
};

export const contactCell: TTableCell = {
	id: TTableCellName.Contact,
	Component: TextCell,
	props: { minWidth: 130 },
	value: ""
};

export const latestMessageCell: TTableCell = {
	id: TTableCellName.LatestMessage,
	Component: TextCell,
	value: ""
};
