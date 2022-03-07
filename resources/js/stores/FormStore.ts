import { action, computed, has, makeAutoObservable } from "mobx";
import {
	TForm,
	TFormField,
	TFormFieldName,
	TFormStyle,
	TSavedFormValue,
	TSectionName
} from "../typings/forms";
import { getSectionFromHash } from "../utils/formatting";
import { fieldMeetsDependencies } from "../utils/validation";

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

	constructor(form: TForm, handleSubmit: Function, sections: TSectionName[], initialData?) {
		this.form = form;
		this.setFields(form.fields);
		this.sections = sections;
		this.handleSubmit = handleSubmit;

		if (initialData) {
			this.loadValues(initialData);
		}

		if (sections && location.hash) {
			const sectionToSet = getSectionFromHash(location.hash);
			this.setActiveSection(this.sections[sectionToSet]);
		}

		makeAutoObservable(this, {
			getFieldValue: action.bound,
			setFieldValue: action.bound,
			setActiveSection: action.bound,
			setFields: action.bound,
			style: computed,
			succesText: computed,
			isFirstSection: computed,
			isLastSection: computed,
			goToNextSection: action.bound,
			goToPrevSection: action.bound,
			createKeyValuePairs: action.bound,
			loadValues: action.bound,
			getSectionByIndex: action.bound,
			clearFields: action.bound,
			validate: action.bound,
			getErrors: action.bound
		});
	}

	get isFirstSection() {
		if (!this.sections) {
			return true;
		}
		return this.activeSection === this.sections[0] || !this.activeSection;
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

	getSectionByIndex(section: TSectionName) {
		if (!this.sections) {
			return -1;
		}
		return this.sections.indexOf(section);
	}

	goToPrevSection() {
		const currentIndex = this.sections.findIndex(section => section === this.activeSection);
		this.setActiveSection(this.sections[currentIndex - 1]);
		setTimeout(() => {
			window.scrollTo(0, 0);
		}, 0);
	}

	goToNextSection() {
		const currentIndex = this.sections.findIndex(section => section === this.activeSection);
		this.setActiveSection(this.sections[currentIndex + 1]);
		setTimeout(() => {
			window.scrollTo(0, 0);
		}, 0);
	}

	setActiveSection(section: TSectionName) {
		const sessionIndex = this.getSectionByIndex(section);
		if (history.pushState && (sessionIndex != 0 || this.activeSection)) {
			history.pushState(null, null, `#${sessionIndex}`);
		} else if (!history.pushState) {
			location.hash = `${sessionIndex}`;
		}

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
		this.fields
			.filter(f => fieldMeetsDependencies(f, this.values))
			.forEach(field => {
				const value = this.values.get(field.id);
				if (field.validate && !field.validate(value, this.values)) {
					this.errors.set(field.id, "field_not_valid");
				}
				if (field.required && value == "") {
					this.errors.set(field.id, "field_required");
				}
			});
		const hasError = [...this.errors.values()].length;

		if (hasError && !!this.sections) {
			const firstErrorKey = [...this.errors.keys()][0];
			const fieldWithError = this.fields.find(f => f.id === firstErrorKey);
			this.setActiveSection(fieldWithError.section);
		}
		return !hasError;
	}

	getErrors() {
		return this.errors;
	}

	submit = async e => {
		e.preventDefault();
		if (this.validate()) {
			this.setIsSubmitting(true);
			const keyValuePairs = this.createKeyValuePairs();
			const { errors, exception } = (await this.handleSubmit(keyValuePairs)) || {};
			if (errors) {
				this.errors = new Map<TFormFieldName, any>(Object.entries(errors) as any);
				this.setIsSubmitting(false);
			} else if (!exception) {
				this.setIsDone(true);
			} else {
				this.setIsSubmitting(false);
			}
		}
		this.setIsSubmitting(false);
	};

	setIsSubmitting = isSubmitting => {
		this.isSubmitting = isSubmitting;
	};

	createKeyValuePairs() {
		return this.fields.reduce((base, field) => {
			const value = this.values.get(field.id);
			if (
				(!field.validate && value !== "") ||
				(field.validate && field.validate(value, this.values))
			) {
				base[field.id] = this.values.get(field.id);
			}
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
		if (!this.form.keepValuesAfterSubmit) {
			this.clearFields();
		}
	}

	clearFields() {
		for (let { id, value } of this.fields) {
			this.setFieldValue(id, value);
		}
	}

	getFieldValue(id: TFormFieldName) {
		return this.values.get(id);
	}

	loadValues(values: TSavedFormValue[]) {
		if (!values) {
			return;
		}
		values.forEach(({ key, value }) => {
			if (values[key] !== null) {
				this.setFieldValue(key, value);
			}
		});
	}
}
