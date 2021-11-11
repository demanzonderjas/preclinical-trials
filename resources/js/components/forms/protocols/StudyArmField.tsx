import { observer } from "mobx-react-lite";
import React from "react";
import { studyArmModel, studyArmOptions } from "../../../data/forms/fields/protocol/studyArms";
import { useFormField } from "../../../hooks/useForm";
import { TFormFieldName } from "../../../typings/forms";
import { TStudyArm } from "../../../typings/protocols";

export const StudyArmField: React.FC<{ id: TFormFieldName }> = observer(({ id }) => {
	const { value: studyArms, setValue } = useFormField(id);

	const setStudyArmValue = (index: number, key: string, value: any) => {
		const newArms = [...studyArms];
		newArms[index] = { ...newArms[index], [key]: value };
		setValue(newArms);
	};

	const deleteArm = (index: number) => {
		const newArms = [...studyArms];
		newArms.splice(index, 1);
		setValue(newArms);
	};

	const addArm = (e: any) => {
		e.preventDefault();
		const newArms = [...studyArms, { ...studyArmModel }];
		setValue(newArms);
	};

	return (
		<div className="StudyArmField">
			{studyArms.map((arm: TStudyArm, index: number) => (
				<div className="StudyArmInfo" key={index}>
					<select
						value={arm.arm}
						onChange={e => setStudyArmValue(index, "arm", e.target.value)}
					>
						<option value="" />
						{studyArmOptions.map(option => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
					<input
						type="number"
						value={arm.number || ""}
						onChange={e => setStudyArmValue(index, "number", e.target.value)}
					/>
					<input
						type="text"
						value={arm.intervention || ""}
						onChange={e => setStudyArmValue(index, "intervention", e.target.value)}
						placeholder="Intervention"
					/>
					<div className="Delete" onClick={() => deleteArm(index)}>
						DELETE
					</div>
				</div>
			))}
			<button onClick={addArm}>Add Study Arm/Group</button>
		</div>
	);
});
