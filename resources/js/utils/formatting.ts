import day from "dayjs";
import { createFAQItemForm } from "../data/forms/faq";
import { createNewsItemForm } from "../data/forms/news";
import { TFaqItem } from "../typings/faq";
import { TForm, TFormFieldName, TSavedFormValue } from "../typings/forms";
import { TNewsItem } from "../typings/news";
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
		{
			id: protocol.id,
			updated_at: protocol.updated_at,
			created_at: protocol.created_at,
			status: protocol.status,
			comments: protocol.comments
		}
	);
}

export function getDateTimeFormat(date: string) {
	return day(date).format("DD/MM/YYYY hh:mm");
}

export function getRevisionDate(date: string, number: number) {
	return `V${number} - ${getDateTimeFormat(date)}`;
}

export async function fileToJSON(file: File) {
	return new Promise((resolve, reject) => {
		const fileReader = new FileReader();
		fileReader.onload = event => resolve(JSON.parse(event.target.result as string));
		fileReader.onerror = error => reject(error);
		fileReader.readAsText(file);
	});
}

export function mapFaqItemToKeyValueArray(faqItem: TFaqItem): TSavedFormValue[] {
	if (!faqItem) {
		return null;
	}
	return createFAQItemForm.fields.map(field => ({
		key: field.id,
		value: faqItem[field.id]
	}));
}

export function mapNewsItemToKeyValueArray(newsItem: TNewsItem): TSavedFormValue[] {
	if (!newsItem) {
		return null;
	}
	return createNewsItemForm.fields.map(field => ({
		key: field.id,
		value: newsItem[field.id]
	}));
}

export function mapModelToKeyValueArray(model: any, form: TForm): TSavedFormValue[] {
	if (!model) {
		return null;
	}
	return form.fields.map(field => ({
		key: field.id,
		value: model[field.id]
	}));
}
