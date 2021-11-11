import React, { useState } from "react";
import { useFormField } from "../../hooks/useForm";
import { TFormFieldName } from "../../typings/forms";
import cx from "classnames";
import { observer } from "mobx-react-lite";
import { Image } from "../base/Image";

type SelectFieldProps = {
	id: TFormFieldName;
	options: string[];
};

export const SelectField: React.FC<SelectFieldProps> = observer(({ id, options }) => {
	const { value, setValue } = useFormField(id);
	const [isActive, setIsActive] = useState(false);

	return (
		<div className={cx("SelectField", { active: isActive })}>
			<div className="select-wrapper">
				<div
					className={cx("active-option", { "with-value": !!value })}
					onClick={() => {
						setIsActive(!isActive);
					}}
				>
					<SelectOption value={!value ? "Select option" : value} />
					<Image filename="arrow-down-white.svg" />
				</div>
				<div className="dropdown with-custom-scrollbar">
					{value && (
						<SelectOption
							handleClick={() => {
								setValue(value);
								setIsActive(!isActive);
							}}
							value={value}
						/>
					)}
					{options
						.filter(option => option != value)
						.map(option => (
							<SelectOption
								key={option}
								isSelected={option === value}
								value={option}
								handleClick={() => {
									console.log("option", option);
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
	isSelected?: boolean;
}> = observer(({ value, handleClick, isSelected }) => {
	return (
		<div className="SelectOption" onClick={handleClick ? () => handleClick() : undefined}>
			<span>{value}</span>
			{isSelected && (
				<div className="image-wrapper">
					<Image filename="check.svg" />
				</div>
			)}
		</div>
	);
});
