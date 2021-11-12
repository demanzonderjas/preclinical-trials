import React, { useEffect, useState } from "react";
import { Image } from "../base/Image";
import cx from "classnames";
import { TForm, TSectionName } from "../../typings/forms";
import { FormStoreContext } from "../../contexts/FormStoreContext";
import { FormStore } from "../../stores/FormStore";
import { FormFields } from "../forms/FormField";
import { SuccessMessage } from "../forms/SuccessMessage";
import { FormSections } from "../forms/FormSections";
import { ControlButtons } from "../forms/protocols/ControlButtons";

export const FormBlock: React.FC<{
	form: TForm;
	icon: string;
	sections?: TSectionName[];
	handleSubmit: Function;
}> = ({ children, icon, sections, form, handleSubmit }) => {
	const [formStore, setFormStore] = useState(null);

	useEffect(() => {
		setFormStore(new FormStore(form, handleSubmit, sections));
	}, [handleSubmit]);

	const { align, fields } = form;

	if (!formStore) {
		return null;
	}

	return (
		<FormStoreContext.Provider value={formStore}>
			<div className={cx("FormBlock", { "with-sections": !!sections })}>
				{!!sections && <FormSections sections={sections} />}
				<div className="icon-wrapper">
					<Image filename={icon} />
				</div>
				<div className="FormWrapper">
					<form
						onSubmit={formStore.submit}
						style={{ textAlign: align }}
						className={cx({ [align]: true })}
					>
						{children}
						<FormFields fields={fields} />
						<ControlButtons />
						<SuccessMessage />
					</form>
				</div>
			</div>
		</FormStoreContext.Provider>
	);
};
