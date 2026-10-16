import JoditEditor from "jodit-react";
import { observer } from "mobx-react-lite";
import React, { useRef } from "react";
import { useFormField } from "../../hooks/useForm";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { TFormFieldName } from "../../typings/forms";
import { TContentBlock } from "../../typings/pages";
import { joditConfig } from "../../utils/jodit";

export const ContentBlocksField: React.FC<{ id: TFormFieldName; height?: number }> = observer(
	({ id, height = 500 }) => {
		const editor = useRef(null);
		const { value: contentBlocks, setValue } = useFormField(id);
		const { t } = useTranslationStore();

		const updateContent = (blockIdx: number, newContent) => {
			const clone = [...contentBlocks];
			const blockClone: TContentBlock = { ...clone[blockIdx], content: newContent };
			clone[blockIdx] = blockClone;
			setValue(clone);
		};

		const config = {
			...joditConfig,
			height: `${height}px`
		};

		return (
			<div className="ContentBlocksField">
				{contentBlocks.map((contentBlock: TContentBlock, idx) => (
					<div className="RichTextField" key={idx}>
						<label>
							{t("section")} {idx + 1}
						</label>
						<JoditEditor
							ref={editor}
							value={contentBlock.content}
							config={config}
							onBlur={newContent => updateContent(idx, newContent)}
						/>
					</div>
				))}
			</div>
		);
	}
);
