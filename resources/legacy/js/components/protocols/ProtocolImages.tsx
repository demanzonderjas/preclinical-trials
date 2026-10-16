import { observer } from "mobx-react-lite";
import React from "react";
import { useModalStore } from "../../hooks/useModalStore";
import { useRevisions } from "../../hooks/useRevisions";
import { imageModal } from "../../data/modals/image";
import { TFormField } from "../../typings/forms";
import { getProtocolImageUrl, toFilenames } from "../../utils/images";

export const ProtocolImages: React.FC<{ field: TFormField; offset?: number }> = observer(
	({ field, offset = 0 }) => {
		const revisionStore = useRevisions();
		const { setModal } = useModalStore();

		const getRealValue = () => {
			if (revisionStore) {
				return revisionStore.getValueAtVersion(
					field.id,
					revisionStore.activeVersion - offset
				);
			}
			return field.value;
		};

		const filenames = toFilenames(getRealValue());

		if (!filenames.length) {
			return null;
		}

		return (
			<div className="ProtocolImages">
				{filenames.map(filename => (
					<img
						key={filename}
						src={getProtocolImageUrl(filename)}
						onClick={() =>
							setModal({
								...imageModal,
								data: { src: getProtocolImageUrl(filename) }
							})
						}
					/>
				))}
			</div>
		);
	}
);
