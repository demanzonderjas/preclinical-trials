import React, { useState, useEffect } from "react";
import { useForm } from "../../hooks/useForm";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { TFormFieldName } from "../../typings/forms";
import { fileToJSON } from "../../utils/formatting";
import { convertPRIStoKeyValuePairs } from "../../utils/pris";

export const ImportPRIS: React.FC = () => {
	const [file, setFile] = useState(null);
	const { t } = useTranslationStore();
	const { setFieldValue } = useForm();

	useEffect(() => {
		if (file) {
			(async () => {
				const data: any = await fileToJSON(file);
				console.log(data);
				const keyValuePairs = convertPRIStoKeyValuePairs(data.content);
				console.log(keyValuePairs);
				Object.keys(keyValuePairs).forEach((key: TFormFieldName) => {
					setFieldValue(key, keyValuePairs[key]);
				});
			})();
		}
	}, [file]);

	return (
		<div className="ImportPRIS UploadButton">
			<button className="secondary small" onClick={e => e.preventDefault()}>
				{t("import_pris")}
			</button>
			<input type="file" onChange={e => setFile(e.target.files[0])} />
		</div>
	);
};
