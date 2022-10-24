import React from "react";
import { FilterStoreProvider } from "../../contexts/FilterStoreContext";
import { studyArmsTable, studyCentreTable } from "../../data/tables/protocols";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { FilterStore } from "../../stores/FilterStore";
import { TFormField, TFormFieldName } from "../../typings/forms";
import { TStudyArm, TStudyCentre } from "../../typings/protocols";
import { fieldMeetsDependencies } from "../../utils/validation";
import { TableBlock } from "../tables/TableBlock";
import { RealTimeValue } from "./RealTimeValue";

export const ProtocolValue: React.FC<{
	id: TFormFieldName;
	value: any;
	offset?: number;
	fields: TFormField[];
	valueMap: Map<TFormFieldName, any>;
}> = ({ id, value, fields, offset, valueMap }) => {
	const { t } = useTranslationStore();
	switch (id) {
		case TFormFieldName.StudyArms:
			return <StudyArmsValue value={value} />;
		case TFormFieldName.StudyCentre:
			return <StudyCentreValue value={value} />;
		case TFormFieldName.FinancialSupport:
			return (
				<ArrayValueWithOtherField
					id={id}
					value={value}
					fields={fields}
					valueMap={valueMap}
				/>
			);
		case TFormFieldName.Species:
		case TFormFieldName.InterventionType:
		case TFormFieldName.Randomisation:
		case TFormFieldName.InvestigatorsBlindedIntervention:
		case TFormFieldName.InvestigatorsBlindedAssesment:
		case TFormFieldName.SampleSizeCalculation:
		case TFormFieldName.ExclusiveAnimalUse:
		case TFormFieldName.Status:
			return (
				<CombinedValue
					id={id}
					value={value}
					fields={fields}
					valueMap={valueMap}
					offset={offset}
				/>
			);
		case TFormFieldName.StatementOfAccuracy:
			return <p>{t("yes")}</p>;
		default:
			return <p>{t(value)}</p>;
	}
};

export const ArrayValueWithOtherField: React.FC<{
	id: TFormFieldName;
	value: any;
	fields: TFormField[];
	valueMap: Map<TFormFieldName, any>;
}> = ({ id, value, fields, valueMap }) => {
	const otherValueField = fields.find(f => f.showValueIn === id);
	const { t } = useTranslationStore();
	const needCombinedValue =
		fieldMeetsDependencies(otherValueField, valueMap) || otherValueField.value;

	if (!needCombinedValue) {
		return <p>{Array.isArray(value) ? value?.map(v => t(v)).join(", ") : t(value)}</p>;
	}

	return (
		<p>
			<strong>{Array.isArray(value) ? value?.map(v => t(v)).join(", ") : t(value)}</strong>-{" "}
			{t(otherValueField?.value)}
		</p>
	);
};

export const CombinedValue: React.FC<{
	id: TFormFieldName;
	value: any;
	offset?: number;
	fields: TFormField[];
	valueMap: Map<TFormFieldName, any>;
}> = ({ id, value, fields, offset, valueMap }) => {
	const { t } = useTranslationStore();
	const otherValueFields = fields.filter(
		f => f.showValueIn === id && fieldMeetsDependencies(f, valueMap)
	);

	if (!otherValueFields.length) {
		return <p>{t(value)}</p>;
	}

	if (otherValueFields.some(f => f.showAsLink)) {
		return (
			<p>
				<strong>{t(value)}</strong> -{" "}
				{otherValueFields.map(f => {
					return f.showAsLink ? (
						<a target="_blank" key={f.value} href={f.value}>
							{f.value}
						</a>
					) : (
						<RealTimeValue field={f} fields={fields} offset={offset} />
					);
				})}
			</p>
		);
	}

	return (
		<p>
			<strong>{t(value)}</strong>
			{otherValueFields.map(f => (
				<React.Fragment key={f.id}>
					{" "}
					-{" "}
					{f.id === TFormFieldName.PlaceboControlled ? (
						`${t("the_intervention_was")}${f.value === "yes" ? "" : t("not")} ${t(
							"placebo_controlled_label"
						)}`
					) : (
						<RealTimeValue field={f} fields={fields} offset={offset} />
					)}
				</React.Fragment>
			))}
		</p>
	);
};

export const StudyArmsValue: React.FC<{ value: TStudyArm[] }> = ({ value }) => {
	return (
		<div className="StudyArmsValue">
			<FilterStoreProvider store={new FilterStore()}>
				<TableBlock rows={value} table={studyArmsTable} />
			</FilterStoreProvider>
		</div>
	);
};

export const StudyCentreValue: React.FC<{ value: TStudyCentre[] }> = ({ value }) => {
	return (
		<div className="StudyArmsValue">
			<FilterStoreProvider store={new FilterStore()}>
				<TableBlock rows={value} table={studyCentreTable} />
			</FilterStoreProvider>
		</div>
	);
};
