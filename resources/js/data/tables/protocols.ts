import { TTable, TTableCellName } from "../../typings/tables";
import {
	actionCell,
	armCell,
	cityCell,
	countryCell,
	hasEmbargoCell,
	interventionCell,
	lastUpdatedAtCell,
	nameCell,
	numberCell,
	studyStatusCell,
	studyCentreCell,
	titleCell,
	publishStatusCell,
	adminActionCell,
	magicSearchCell,
	idCell,
	embargoDateCell,
	commentsCell,
	pctIdCell,
	selectCell
} from "./cells/protocol";

export const adminProtocolsTable: TTable = {
	headers: [
		TTableCellName.ID,
		TTableCellName.Title,
		TTableCellName.LastUpdated,
		TTableCellName.PublishStatus,
		TTableCellName.HasEmbargo,
		TTableCellName.EmbargoDate,
		TTableCellName.Comments,
		TTableCellName.AdminAction
	],
	cells: [
		idCell,
		titleCell,
		lastUpdatedAtCell,
		publishStatusCell,
		hasEmbargoCell,
		embargoDateCell,
		commentsCell,
		adminActionCell
	]
};

export const manageProtocolsTable: TTable = {
	headers: [
		TTableCellName.PctId,
		TTableCellName.Title,
		TTableCellName.PublishStatus,
		TTableCellName.LastUpdated,
		TTableCellName.StudyStatus,
		TTableCellName.Comments,
		TTableCellName.Action
	],
	cells: [
		pctIdCell,
		titleCell,
		publishStatusCell,
		lastUpdatedAtCell,
		studyStatusCell,
		commentsCell,
		actionCell
	]
};

export const searchProtocolsTable: TTable = {
	headers: [
		TTableCellName.Title,
		TTableCellName.StudyCentre,
		TTableCellName.StudyStatus,
		TTableCellName.MagicSearch
	],
	targetOnRowClick: "/database/view-protocol",
	cells: [titleCell, studyCentreCell, studyStatusCell, magicSearchCell]
};

export const selectProtocolsTable: TTable = {
	headers: [TTableCellName.Empty, ...searchProtocolsTable.headers],
	cells: [selectCell, ...searchProtocolsTable.cells]
};

export const studyArmsTable: TTable = {
	headers: [TTableCellName.Type, TTableCellName.Number, TTableCellName.Intervention],
	cells: [armCell, numberCell, interventionCell]
};

export const studyCentreTable: TTable = {
	headers: [TTableCellName.Name, TTableCellName.City, TTableCellName.Country],
	cells: [nameCell, cityCell, countryCell]
};
