import React from "react";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { TSearchResult } from "../../typings/tables";
import xss from "xss";

export const MagicSearchCell: React.FC<{ value: TSearchResult }> = ({ value: result }) => {
	const { t } = useTranslationStore();
	const SUBSTRING_SURROUNDING_TEXT_LENGTH = 30;

	if (!result) {
		return <td className="TextCell"></td>;
	}

	const findFirstWordPosition = (currentPosition: number) => {
		if (currentPosition <= 0) {
			return 0;
		}
		if (!result.value[currentPosition].match(/\s/)) {
			return findFirstWordPosition(currentPosition - 1);
		}
		return currentPosition;
	};

	const findLastWordPosition = (currentPosition: number) => {
		if (
			currentPosition >= result.value.length - 1 ||
			currentPosition === -1 ||
			!result.value[currentPosition]
		) {
			return result.value.length - 1;
		}
		if (!result.value[currentPosition].match(/\s/)) {
			return findLastWordPosition(currentPosition + 1);
		}
		return currentPosition;
	};

	const startingPosition = findFirstWordPosition(
		result.position - SUBSTRING_SURROUNDING_TEXT_LENGTH
	);
	const endPosition = findLastWordPosition(result.position + SUBSTRING_SURROUNDING_TEXT_LENGTH);

	const highlight = (start, end) => {
		const searchString = result.value.toString();
		const highlightedValue = t(
			searchString.substring(result.position, result.position + result.filterValue.length)
		);
		const followingValue = searchString.substring(
			result.position + result.filterValue.length,
			end + 1
		);
		return `${startingPosition > 0 ? "..." : ""}
			${searchString.substring(
				start,
				result.position
			)}<span class="highlight">${highlightedValue}</span>${
			followingValue !== highlightedValue ? followingValue : ""
		}${endPosition < searchString.length - 1 ? "..." : ""}`;
	};

	return (
		<td className="TextCell">
			<strong>{t(result.key)}</strong>:{" "}
			<span
				dangerouslySetInnerHTML={{ __html: xss(highlight(startingPosition, endPosition)) }}
			/>
		</td>
	);
};
