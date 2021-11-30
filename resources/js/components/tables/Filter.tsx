import { observer } from "mobx-react-lite";
import React from "react";
import { useFilter } from "../../hooks/useFilter";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { TFormFieldName } from "../../typings/forms";
import { GenericSelectField } from "../forms/SelectField";

export const Filter: React.FC<{ options: string[]; filterPlaceholder?: string }> = observer(
	({ options, filterPlaceholder }) => {
		const { t } = useTranslationStore();
		const {
			activeFilterText,
			setActiveFilterText,
			activeFilterKey,
			setActiveFilterKey,
			addFilter,
			deleteFilter,
			filters
		} = useFilter();

		return (
			<div className="Filter layout-wrapper">
				<div className="SearchBar">
					<input
						type="text"
						placeholder={t("enter_search")}
						value={activeFilterText}
						onChange={e => setActiveFilterText(e.target.value)}
					/>
					<GenericSelectField
						setValue={value => setActiveFilterKey(value as TFormFieldName)}
						value={activeFilterKey || ""}
						options={[...options]}
						clearPlaceholder="clear"
						emptyPlaceholder={filterPlaceholder || "any_field"}
					/>
					<div className="AddFilter" onClick={addFilter}>
						<span>{t("add_filter")}</span>
					</div>
				</div>
				<div className="ActiveFilters">
					<h3>
						{t("active_filters")} ({filters.length})
					</h3>
					<div className="filters">
						{filters.map((filter, idx) => (
							<div className="ActiveFilter" key={idx}>
								<div className="flex-wrapper">
									<span className="value">{t(filter.value)}</span>
									{filter.key && (
										<span className="value key">{t(filter.key)}</span>
									)}
								</div>
								<div className="delete" onClick={() => deleteFilter(idx)}>
									<span>x</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}
);
