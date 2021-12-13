import JoditEditor from "jodit-react";
import { observer } from "mobx-react-lite";
import React, { useRef } from "react";
import { useFormField } from "../../hooks/useForm";
import { TFormFieldName } from "../../typings/forms";
import { joditConfig } from "../../utils/jodit";

export const RichTextField: React.FC<{ id: TFormFieldName; height?: number }> = observer(
	({ id, height = 500 }) => {
		const editor = useRef(null);
		const { value, setValue } = useFormField(id);

		const config = {
			...joditConfig,
			height: `${height}px`
		};

		return (
			<div className="RichTextField">
				<JoditEditor
					ref={editor}
					value={value}
					config={config}
					onBlur={newContent => setValue(newContent)}
				/>
			</div>
		);
	}
);
