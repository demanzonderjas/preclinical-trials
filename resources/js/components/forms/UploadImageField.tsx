import { observer } from "mobx-react-lite";
import React from "react";
import { useFormField } from "../../hooks/useForm";
import { deleteImageQuery, uploadImageQuery } from "../../queries/news";
import { TFormFieldName, TFormFieldProps } from "../../typings/forms";
import cx from "classnames";
import { useTranslationStore } from "../../hooks/useTranslationStore";

export const UploadImageField: React.FC<TFormFieldProps & {
	id: TFormFieldName;
}> = observer(({ id }) => {
	const { value, setValue } = useFormField(id);
	const { t } = useTranslationStore();

	const upload = async (e: any) => {
		const response = await uploadImageQuery(e.target.files[0]);
		setValue(response.filename);
	};

	const deleteImage = async e => {
		await deleteImageQuery(value);
		setValue(null);
	};

	return (
		<div className={cx("UploadImageField", { with_image: !!value })}>
			<div className="UploadButton">
				<button type="button" className="secondary small" onClick={e => e.preventDefault()}>
					{t("upload_image")}
				</button>
				<input type="file" onChange={upload} />
			</div>
			{value && (
				<div className="preview">
					<div className="image-wrapper">
						<img src={`/images/${value}`} />
						<div className="overlay">
							<button
								type="button"
								className="small delete danger"
								onClick={deleteImage}
							>
								{t("delete")}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
});
