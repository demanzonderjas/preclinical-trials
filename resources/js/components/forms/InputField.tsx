import { observer } from "mobx-react-lite";
import React, { useEffect, useRef, useState } from "react";
import { useForm, useFormField } from "../../hooks/useForm";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { TFormFieldName, TFormFieldProps, TFormStyle } from "../../typings/forms";

export const InputField: React.FC<TFormFieldProps & {
	id: TFormFieldName;
	required: boolean;
	label: string;
	placeholder?: string;
}> = observer(({ type = "text", id, label, placeholder }) => {
	const { value, setValue } = useFormField(id);
	const { t } = useTranslationStore();
	const { style } = useForm();
	const textareaRef = useRef<HTMLElement>();
	const LINE_HEIGHT = 20;
	const [height, setHeight] = useState(LINE_HEIGHT);

	useEffect(() => {
		if (textareaRef.current) {
			const TOTAL_WIDTH = textareaRef.current.clientWidth;
			const ALLOWED_SENTENCE_LENGTH = TOTAL_WIDTH / 12;
			const REQUIRED_SENTENCES = Math.ceil(value.length / ALLOWED_SENTENCE_LENGTH);
			setHeight(Math.max(REQUIRED_SENTENCES * LINE_HEIGHT, LINE_HEIGHT));
		}
	}, [value]);

	if (type === "text") {
		return (
			<div className="InputField">
				<textarea
					ref={textareaRef as any}
					style={{ height: `${height + 40}px` }}
					value={value || ""}
					onChange={e => setValue(e.target.value)}
					placeholder={
						style === TFormStyle.InlinePlaceholder ? t(label) : t(placeholder || "")
					}
				/>
			</div>
		);
	}

	return (
		<div className="InputField">
			<input
				type={type}
				value={value || ""}
				onChange={e => setValue(e.target.value)}
				placeholder={
					style === TFormStyle.InlinePlaceholder ? t(label) : t(placeholder || "")
				}
			/>
		</div>
	);
});
