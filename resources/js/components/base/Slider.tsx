import React, { useState } from "react";

export const Slider: React.FC<{ defaultValue: boolean; handleToggle: Function }> = ({
	defaultValue,
	handleToggle
}) => {
	const [checked, setChecked] = useState<boolean>(defaultValue);

	return (
		<div className="Slider">
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
