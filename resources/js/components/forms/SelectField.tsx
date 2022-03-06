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
	allowMulti?: boolean;
};

export const GenericSelectField: React.FC<{
	value: string;
	setValue: Function;
	options: string[];
	minWidth?: number;
	emptyPlaceholder?: string;
	clearPlaceholder?: string;
}> = ({ value, setValue, options, emptyPlaceholder, minWidth, clearPlaceholder }) => {
	const [isActive, setIsActive] = useState(false);
	const { t } = useTranslationStore();

	return (
		<div
			className={cx("SelectField", { active: isActive, absolute: true })}
			style={{ minWidth: minWidth ? `${minWidth}px` : null }}
		>
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

export const SelectField: React.FC<SelectFieldProps> = observer(({ id, options, allowMulti }) => {
	const { value, setValue } = useFormField(id);
	const [isActive, setIsActive] = useState(false);
	const { t } = useTranslationStore();

	const setMultiValue = (target: string) => {
		const existingIndex = value.indexOf(target);
		if (existingIndex > -1) {
			const newValue = [...value];
			newValue.splice(existingIndex, 1);
			setValue(newValue);
		} else {
			setValue([...value, target]);
		}
	};

	const getActiveValue = (value: any) => {
		if (allowMulti) {
			return value.map(v => t(v)).join(", ");
		} else {
			return value;
		}
	};

	return (
		<div className={cx("SelectField", { active: isActive })}>
			<div className="select-wrapper">
				<div
					className={cx("active-option", { "with-value": !!value })}
					onClick={() => {
						setIsActive(!isActive);
					}}
				>
					<SelectOption value={!value ? t("select_option") : getActiveValue(value)} />
					<Image filename="arrow-down-white.svg" />
				</div>
				<div className="dropdown with-custom-scrollbar">
					{options.map(option => (
						<SelectOption
							key={option}
							isSelected={allowMulti ? value.indexOf(option) > -1 : option === value}
							value={option}
							handleClick={() => {
								if (allowMulti) {
									setMultiValue(option);
								} else {
									setValue(option);
									setIsActive(!isActive);
								}
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
