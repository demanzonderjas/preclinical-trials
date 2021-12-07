import { observer } from "mobx-react-lite";
import React, { useState, useEffect } from "react";
import { useFormField } from "../../../hooks/useForm";
import { getFAQCategories } from "../../../queries/faq";
import { TFaqCategory } from "../../../typings/faq";
import { TFormFieldName } from "../../../typings/forms";
import { GenericSelectField } from "../SelectField";

export const FAQCategoryField: React.FC<{ id: TFormFieldName }> = observer(({ id }) => {
	const [categories, setCategories] = useState<TFaqCategory[]>([]);
	const { value, setValue } = useFormField(id);

	const setOptionValue = (option: string) => {
		const category = categories.find(c => c.name === option);
		setValue(category.id);
	};

	const stringValue = categories.find(c => c.id === value)?.name;

	useEffect(() => {
		(async () => {
			const response = await getFAQCategories();
			setCategories(response.categories);
		})();
	}, []);

	return (
		<div className="FAQCategoryField">
			<GenericSelectField
				emptyPlaceholder="choose_category"
				options={categories.map(c => c.name)}
				value={stringValue}
				setValue={setOptionValue}
			/>
		</div>
	);
});
