import { action, computed, makeAutoObservable } from "mobx";
import { TForm, TFormField, TFormFieldName, TFormStyle, TSectionName } from "../typings/forms";

export class FormStore {
	fields: TFormField[] = [];

	values: Map<TFormFieldName, any> = new Map<TFormFieldName, any>();

	isSubmitting: boolean = false;

	errors: Map<TFormFieldName, any> = new Map<TFormFieldName, any>();

	serverSideError: string = null;

	form: TForm = null;

	isDone: boolean = false;

	activeSection: TSectionName = null;

	sections: TSectionName[] = null;

	handleSubmit: Function = null;

	constructor(form: TForm, handleSubmit: Function, sections: TSectionName[]) {
		this.form = form;
		this.setFields(form.fields);
		this.sections = sections;
		this.handleSubmit = handleSubmit;
		makeAutoObservable(this, {
			getFieldValue: action.bound,
			setFieldValue: action.bound,
			setActiveSection: action.bound,
			setFields: action.bound,
			style: computed,
			succesText: computed,
			isLastSection: computed,
			goToNextSection: action.bound
		});
	}

	get isLastSection() {
		if (!this.sections) {
			return true;
		}
		return this.activeSection === this.sections[this.sections.length - 1];
	}

	get style() {
		return this.form.style;
	}

	get succesText() {
		return this.form.succesText;
	}

	goToNextSection(e: any) {
		e.preventDefault();
		const currentIndex = this.sections.findIndex(section => section === this.activeSection);
		this.setActiveSection(this.sections[currentIndex + 1]);
		setTimeout(() => {
			window.scrollTo(0, 0);
		}, 0);
	}

	setActiveSection(section: TSectionName) {
		this.activeSection = section;
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
