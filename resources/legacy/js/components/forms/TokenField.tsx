import React, { useEffect } from "react";
import { observer } from "mobx-react";
import { useFormField } from "../../hooks/useForm";
import { TFormFieldName } from "../../typings/forms";
import { useParams } from "react-router";

export const TokenField: React.FC = observer(() => {
	const { setValue } = useFormField(TFormFieldName.Token);
	const { token } = useParams() as { token: string };

	useEffect(() => {
		setValue(token);
	}, [token]);

	return null;
});
