import React, { useState } from "react";

export const Slider: React.FC<{
	defaultValue: boolean;
	handleToggle: Function;
	style?: string;
}> = ({ defaultValue, handleToggle, style }) => {
	const [checked, setChecked] = useState<boolean>(defaultValue);

	return (
		<div className={`Slider ${style}`}>
			<label className="switch">
				<input
					type="checkbox"
					checked={checked}
					onChange={() => {
						handleToggle(!checked);
						setChecked(!checked);
					}}
				/>
				<span className="slider"></span>
			</label>
		</div>
	);
};
