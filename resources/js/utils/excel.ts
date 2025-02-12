import { TDBProtocol, TProtocol } from "../typings/protocols";

export async function exportProtocolsToExcel(protocols: TProtocol[]) {
	const XLSX = await import("xlsx");
	const workbook = XLSX.utils.book_new();
	const worksheet = XLSX.utils.json_to_sheet(protocols);
	XLSX.utils.book_append_sheet(workbook, worksheet, "Protocols");

	XLSX.writeFile(workbook, "PCT-Protocol-Export.xlsx", { compression: true });
}
