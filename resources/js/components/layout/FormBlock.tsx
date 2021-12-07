import React, { useEffect, useState } from "react";
import { Image } from "../base/Image";
import cx from "classnames";
import { TForm, TFormFieldName, TSectionName } from "../../typings/forms";
import { FormStoreContext } from "../../contexts/FormStoreContext";
import { FormStore } from "../../stores/FormStore";
import { FormFields } from "../forms/FormField";
import { SuccessMessage } from "../forms/SuccessMessage";
import { FormSections } from "../forms/FormSections";
import { ControlButtons } from "../forms/protocols/ControlButtons";
import { RichTextField } from "../forms/RichTextField";

export const FormBlock: React.FC<{
	form: TForm;
	icon?: string;
	sections?: TSectionName[];
	withoutMargin?: boolean;
	width?: number;
	handleSubmit: Function;
	initialData?: any;
	waitForData?: boolean;
}> = ({
	children,
	icon,
	sections,
	form,
	handleSubmit,
	initialData,
	waitForData,
	withoutMargin
}) => {
	const [formStore, setFormStore] = useState(null);

	useEffect(() => {
		if ((waitForData && initialData) || !waitForData) {
			setFormStore(new FormStore(form, handleSubmit, sections, initialData));
		}
	}, [handleSubmit, initialData]);

	const { align, fields } = form;

	if (!formStore) {
		return null;
	}

	return (
		<FormStoreContext.Provider value={formStore}>
			<div
				className={cx("FormBlock", { "with-sections": !!sections })}
				style={{ margin: withoutMargin ? "0" : null, width: withoutMargin ? "80%" : null }}
			>
				{!!sections && <FormSections sections={sections} />}
				{icon && (
					<div className="icon-wrapper">
						<Image filename={icon} />
					</div>
				)}
				<div
					className="FormWrapper"
					style={{ padding: withoutMargin ? "10px 30px 30px" : null }}
				>
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
