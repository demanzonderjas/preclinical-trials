import { action, makeAutoObservable } from "mobx";
import { TFormField, TFormFieldName, TFormStyle } from "../typings/forms";

export class FormStore {
	fields: TFormField[] = [];

	values: Map<TFormFieldName, any> = new Map<TFormFieldName, any>();

	isSubmitting: boolean = false;

	style: TFormStyle = TFormStyle.RegularLabels;

	errors: Map<TFormFieldName, any> = new Map<TFormFieldName, any>();

	serverSideError: string = null;

	succesText: string = null;

	isDone: boolean = false;

	handleSubmit: Function = null;

	constructor(
		fields: TFormField[],
		handleSubmit: Function,
		style: TFormStyle,
		succesText: string
	) {
		this.setFields(fields);
		this.handleSubmit = handleSubmit;
		this.succesText = succesText;
		this.style = style;
		makeAutoObservable(this, {
			getFieldValue: action.bound,
			setFieldValue: action.bound,
			setFields: action.bound
		});
	}

	setFields(fields) {
		this.fields = fields;
		for (let { id, value } of fields) {
			this.setFieldValue(id, value);
		}
	}

	@action.bound validate() {
		this.errors.clear();
		this.fields.forEach(field => {
			const value = this.values.get(field.id);
			if (field.validate && !field.validate(value, this.values)) {
				this.errors.set(field.id, "field_not_valid");
			}
			if (field.required && value == "") {
				this.errors.set(field.id, "field_required");
			}
		});
		console.log([...this.errors.values()].length);
		return ![...this.errors.values()].length;
	}

	submit = async e => {
		e.preventDefault();
		if (this.validate()) {
			this.setIsSubmitting(true);
			const keyValuePairs = this.createKeyValuePairs();
			const { errors } = await this.handleSubmit(keyValuePairs);
			if (errors) {
				this.errors = new Map<TFormFieldName, any>(Object.entries(errors) as any);
				this.setIsSubmitting(false);
			} else {
				this.setIsDone(true);
			}
		}
	};

	setIsSubmitting = isSubmitting => {
		this.isSubmitting = isSubmitting;
	};

	createKeyValuePairs() {
		return this.fields.reduce((base, field) => {
			base[field.id] = this.values.get(field.id);
			return base;
		}, {});
	}

	setFieldValue(id: TFormFieldName, value: any) {
		this.values.set(id, value);
		this.setError(id, null);
	}

	setError(id: TFormFieldName, error: string) {
		this.errors.set(id, error);
		this.setIsSubmitting(false);
	}

	setIsDone(isDone) {
		this.isDone = isDone;
		this.setIsSubmitting(false);
		this.clearFields();
	}

	clearFields() {
		this.values.clear();
	}

	getFieldValue(id) {
		return this.values.get(id);
	}

	loadValues(values) {
		if (!values) {
			return;
		}
		Object.keys(values).forEach((id: TFormFieldName) => {
			if (values[id] !== null) {
				this.values.set(id, values[id]);
			}
		});
	}
}
