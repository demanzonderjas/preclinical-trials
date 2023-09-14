import { observer } from "mobx-react-lite";
import React, { useState, useEffect } from "react";
import { prisModal } from "../../data/modals/pris";
import { useForm } from "../../hooks/useForm";
import { useModalStore } from "../../hooks/useModalStore";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { TFormFieldName } from "../../typings/forms";
import { fileToJSON } from "../../utils/formatting";
import { convertPRIStoKeyValuePairs } from "../../utils/pris";

export const ImportPRIS: React.FC = observer(() => {
	const [file, setFile] = useState(null);
	const { t } = useTranslationStore();
	const { setFieldValue, validate, getErrors } = useForm();
	const { setModal } = useModalStore();

	useEffect(() => {
		if (file) {
			(async () => {
				const data: any = await fileToJSON(file);
				const keyValuePairs = convertPRIStoKeyValuePairs(data.content);
				Object.keys(keyValuePairs).forEach((key: TFormFieldName) => {
					setFieldValue(key, keyValuePairs[key]);
				});
				setFieldValue(TFormFieldName.ImportType, "pris");
				validate();
				const errors = getErrors();
				if (errors) {
					setModal({ ...prisModal, data: { errors } });
				}
			})();
		}
	}, [file]);

	return (
		<div className="ImportPRIS UploadButton">
			<button className="primary small" onClick={e => e.preventDefault()}>
				{t("import_pris")}
			</button>
			<input type="file" onChange={e => setFile(e.target.files[0])} />
		</div>
	);
});
