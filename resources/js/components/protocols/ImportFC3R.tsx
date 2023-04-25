import { observer } from "mobx-react-lite";
import React, { useState, useEffect } from "react";
import { useForm } from "../../hooks/useForm";
import { useModalStore } from "../../hooks/useModalStore";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { xmlToJSON } from "../../utils/formatting";
import { convertFC3RtoKeyValuePairs } from "../../utils/fc3r";
import { TFormFieldName } from "../../typings/forms";
import { prisModal } from "../../data/modals/pris";

export const ImportFC3R: React.FC = observer(() => {
	const [file, setFile] = useState(null);
	const { t } = useTranslationStore();
	const { setFieldValue, validate, getErrors } = useForm();
	const { setModal } = useModalStore();

	useEffect(() => {
		if (file) {
			(async () => {
				const data: any = await xmlToJSON(file);

				console.log("DATA", data);

				const keyValuePairs = convertFC3RtoKeyValuePairs(data);
				Object.keys(keyValuePairs).forEach((key: TFormFieldName) => {
					setFieldValue(key, keyValuePairs[key]);
				});
				validate();
				const errors = getErrors();
				if (errors) {
					setModal({ ...prisModal, data: { errors } });
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
		</div>
	);
});
