import { observer } from "mobx-react-lite";
import React, { useState, useEffect } from "react";
import { useForm } from "../../hooks/useForm";
import { useModalStore } from "../../hooks/useModalStore";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { xmlToJSON } from "../../utils/formatting";
import { FC3Rfields, convertFC3RtoKeyValuePairs } from "../../utils/fc3r";
import { TFormFieldName } from "../../typings/forms";
import { fc3rModal } from "../../data/modals/fc3r";
import { translateContentQuery } from "../../queries/protocol";
import { Loader, SimpleLoader } from "../layout/Loader";

export const ImportFC3R: React.FC = observer(() => {
	const [file, setFile] = useState(null);
	const { t } = useTranslationStore();
	const { setFieldValue, validate, getErrors } = useForm();
	const [isLoading, setIsLoading] = useState(false);
	const { setModal } = useModalStore();

	useEffect(() => {
		if (file) {
			(async () => {
				setIsLoading(true);
				const data: any = await xmlToJSON(file);

				const keyValuePairs = convertFC3RtoKeyValuePairs(data);
				const keysToTranslate = Object.keys(keyValuePairs).filter(key =>
					FC3Rfields.some(
						field =>
							field.target === key && field.needsTranslation && keyValuePairs[key]
					)
				);

				const translations = await Promise.all(
					keysToTranslate.map(async formFieldName => {
						const response = await translateContentQuery(keyValuePairs[formFieldName]);
						return {
							target: formFieldName as TFormFieldName,
							translation: response.translation
						};
					})
				);

				keyValuePairs[TFormFieldName.Status] = "not_started";
				translations.forEach(response => {
					setFieldValue(response.target, response.translation);
				});
				validate();
				setIsLoading(false);
				const errors = getErrors();
				if (errors) {
					setModal({ ...fc3rModal, data: { errors } });
				}
			})();
		}
	}, [file]);

	return (
		<div className="ImportFC3R UploadButton">
			<button className="secondary small" onClick={e => e.preventDefault()}>
				{t("import_fc3r")}
			</button>
			<input type="file" onChange={e => setFile(e.target.files[0])} />
			{isLoading && <SimpleLoader />}
		</div>
	);
});
