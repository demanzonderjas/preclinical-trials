import { observer } from "mobx-react-lite";
import React from "react";
import { useFormField } from "../../hooks/useForm";
import { TFormFieldName, TFormFieldProps } from "../../typings/forms";
import cx from "classnames";

export const YesNoField: React.FC<TFormFieldProps & {
	id: TFormFieldName;
	label: string;
}> = observer(({ id }) => {
	const { value, setValue } = useFormField(id);

	return (
		<div className="YesNoField">
			<div
				className={cx("choice yes", { active: value == "yes" })}
				onClick={() => setValue("yes")}
			>
				<span>Yes</span>
			</div>
			<div
				className={cx("choice no", { active: value == "no" })}
				onClick={() => setValue("no")}
			>
				<span>No</span>
			</div>
		</div>
	);
});
