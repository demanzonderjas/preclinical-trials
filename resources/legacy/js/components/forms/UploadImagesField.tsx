import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import cx from "classnames";
import { useFormField } from "../../hooks/useForm";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { deleteProtocolImageQuery, uploadProtocolImageQuery } from "../../queries/protocol";
import { TFormFieldName } from "../../typings/forms";
import { getProtocolImageUrl, toFilenames } from "../../utils/images";
import { ImagePreview } from "./ImagePreview";

export const UploadImagesField: React.FC<{ id: TFormFieldName; max?: number }> = observer(
	({ id, max = 1 }) => {
		const { value, setValue } = useFormField(id);
		const { t } = useTranslationStore();
		const [error, setError] = useState<string>(null);
		const filenames = toFilenames(value);
		const roomLeft = max - filenames.length;

		const upload = async (e: any) => {
			const files = Array.from(e.target.files as FileList).slice(0, roomLeft);
			const responses = await Promise.all(files.map(uploadProtocolImageQuery));
			setError(responses.find(r => !r.success)?.message || null);
			setValue([...filenames, ...responses.filter(r => r.success).map(r => r.filename)]);
			e.target.value = "";
		};

		const deleteImage = async (filename: string) => {
			await deleteProtocolImageQuery(filename);
			setValue(filenames.filter(f => f !== filename));
		};

		return (
			<div className={cx("UploadImagesField", { with_image: !!filenames.length })}>
				{filenames.map(filename => (
					<ImagePreview
						key={filename}
						src={getProtocolImageUrl(filename)}
						onDelete={() => deleteImage(filename)}
					/>
				))}
				{roomLeft > 0 && (
					<div className="UploadButton">
						<button
							type="button"
							className="secondary small"
							onClick={e => e.preventDefault()}
						>
							{t(max > 1 ? "upload_images" : "upload_image")}
						</button>
						<input
							type="file"
							accept="image/png,image/jpeg,image/gif"
							multiple={max > 1}
							onChange={upload}
						/>
					</div>
				)}
				{error && <p className="error">{t(error)}</p>}
			</div>
		);
	}
);
