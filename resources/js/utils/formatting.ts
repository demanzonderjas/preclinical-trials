import day from "dayjs";
import { TDBProtocol, TProtocol } from "../typings/protocols";

export function slugify(str: string) {
	str = str.replace(/^\s+|\s+$/g, ""); // trim
	str = str.toLowerCase();

	// remove accents, swap ñ for n, etc
	var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
	var to = "aaaaeeeeiiiioooouuuunc------";
	for (var i = 0, l = from.length; i < l; i++) {
		str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
	}

	str = str
		.replace(/[^a-z0-9 -]/g, "") // remove invalid chars
		.replace(/\s+/g, "_") // collapse whitespace and replace by -
		.replace(/-+/g, "_"); // collapse dashes

	return str;
}

export function getSectionFromHash(hash: string) {
	if (!hash) {
		return 0;
	}
	return hash.split("#").reverse()[0];
}

export function mapProtocolDetailsToObject(protocol: TDBProtocol) {
	return protocol.details.reduce(
		(base, detail) => {
			base[detail.key] = detail.value;
			return base;
		},
		{ id: protocol.id, updated_at: protocol.updated_at }
	);
}

export function getRevisionDate(date: string, number: number) {
	return `V${number} - ${day(date).format("DD/MM/YYYY hh:mm")}`;
}
