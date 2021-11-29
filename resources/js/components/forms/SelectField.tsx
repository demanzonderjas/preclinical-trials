import React, { useState } from "react";
import { useFormField } from "../../hooks/useForm";
import { TFormFieldName } from "../../typings/forms";
import cx from "classnames";
import { observer } from "mobx-react-lite";
import { Image } from "../base/Image";
import { useTranslationStore } from "../../hooks/useTranslationStore";

type SelectFieldProps = {
	id: TFormFieldName;
	options: string[];
};

export const GenericSelectField: React.FC<{
	value: string;
	setValue: Function;
	options: string[];
	emptyPlaceholder?: string;
	clearPlaceholder?: string;
}> = ({ value, setValue, options, emptyPlaceholder, clearPlaceholder }) => {
	const [isActive, setIsActive] = useState(false);
	const { t } = useTranslationStore();

	return (
		<div className={cx("SelectField", { active: isActive, absolute: true })}>
			<div className="select-wrapper">
				<div
					className={cx("active-option", { "with-value": !!value })}
					onClick={() => {
						setIsActive(!isActive);
					}}
				>
					<SelectOption value={!value ? t(emptyPlaceholder || "any_field") : value} />
					<Image filename="triangle.png" />
				</div>
				<div className="dropdown with-custom-scrollbar">
					{value && (
						<SelectOption
							value={""}
							label={clearPlaceholder || "clear"}
							handleClick={() => {
								setValue("");
								setIsActive(!isActive);
							}}
						/>
					)}
					{options.map(option => (
						<SelectOption
							key={option}
							isSelected={option === value}
							value={option}
							handleClick={() => {
								setValue(option);
								setIsActive(!isActive);
							}}
						/>
					))}
				</div>
			</div>
		</div>
	);
};

export const SelectField: React.FC<SelectFieldProps> = observer(({ id, options }) => {
	const { value, setValue } = useFormField(id);
	const [isActive, setIsActive] = useState(false);
	const { t } = useTranslationStore();

	return (
		<div className={cx("SelectField", { active: isActive })}>
			<div className="select-wrapper">
				<div
					className={cx("active-option", { "with-value": !!value })}
					onClick={() => {
						setIsActive(!isActive);
					}}
				>
					<SelectOption value={!value ? t("select_option") : value} />
					<Image filename="arrow-down-white.svg" />
				</div>
				<div className="dropdown with-custom-scrollbar">
					{/* {value && (
						<SelectOption
							handleClick={() => {
								setValue(value);
								setIsActive(!isActive);
							}}
							value={value}
						/>
					)} */}
					{options
						// .filter(option => option != value)
						.map(option => (
							<SelectOption
								key={option}
								isSelected={option === value}
								value={option}
								handleClick={() => {
									setValue(option);
									setIsActive(!isActive);
								}}
							/>
						))}
				</div>
			</div>
		</div>
	);
});

export const SelectOption: React.FC<{
	value: string;
	handleClick?: Function;
	label?: string;
	isSelected?: boolean;
}> = observer(({ value, handleClick, isSelected, label }) => {
	const { t } = useTranslationStore();
	return (
		<div className="SelectOption" onClick={handleClick ? () => handleClick() : undefined}>
			<span>{t(label || value)}</span>
			{isSelected && (
				<div className="image-wrapper">
					<Image filename="check.svg" />
				</div>
			)}
		</div>
	);
});
