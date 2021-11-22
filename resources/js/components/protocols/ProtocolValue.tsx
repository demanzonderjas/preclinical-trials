import React from "react";
import { TFormFieldName } from "../../typings/forms";
import { TStudyArm, TStudyCentre } from "../../typings/protocols";

export const ProtocolValue: React.FC<{ id: TFormFieldName; value: any }> = ({ id, value }) => {
	switch (id) {
		case TFormFieldName.StudyArms:
			return <StudyArmsValue value={value} />;
		case TFormFieldName.StudyCentre:
			return <StudyCentreValue value={value} />;
		default:
			return <p>{value}</p>;
	}
};

export const StudyArmsValue: React.FC<{ value: TStudyArm[] }> = ({ value }) => {
	return (
		<div className="StudyArmsValue">
			{value.map((studyArm, idx) => (
				<div className="StudyArm" key={idx}>
					<span>{studyArm.arm}</span>
					<span>{studyArm.number}</span>
					<span>{studyArm.intervention}</span>
				</div>
			))}
		</div>
	);
};

export const StudyCentreValue: React.FC<{ value: TStudyCentre[] }> = ({ value }) => {
	return (
		<div className="StudyArmsValue">
			{value.map((studyCentre, idx) => (
				<div className="StudyArm" key={idx}>
					<span>{studyCentre.name}</span>
					<span>{studyCentre.city}</span>
					<span>{studyCentre.country}</span>
				</div>
			))}
		</div>
	);
};
