import { TTable, TTableCellName } from "../../typings/tables";
import { ambassadorActionCell, geoSearchCell } from "./cells/ambassadors";
import { lastUpdatedAtCell, nameCell } from "./cells/protocol";

export const ambassadorsTable: TTable = {
	headers: [TTableCellName.Name, TTableCellName.GeoSearch, TTableCellName.AdminAction],
	cells: [nameCell, geoSearchCell, ambassadorActionCell]
};
