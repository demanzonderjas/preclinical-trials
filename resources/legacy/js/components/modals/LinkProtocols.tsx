import React, { useEffect, useState } from "react";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { TProtocol } from "../../typings/protocols";
import {
	getLinkedProtocolsQuery,
	getMyPublishedProtocolsQuery,
	updateLinkedProtocolsQuery
} from "../../queries/protocol";
import { mapProtocolDetailsToObject } from "../../utils/formatting";
import { useModalStore } from "../../hooks/useModalStore";
import { FlexWrapper } from "../layout/FlexWrapper";

export const LinkProtocolsModal: React.FC = () => {
	const { data } = useModalStore();
	const [protocols, setProtocols] = useState<TProtocol[]>([]);
	const [linked, setLinked] = useState<TProtocol[]>([]);
	const [activeSelection, setActiveSelection] = useState<number>(null);
	const { t } = useTranslationStore();

	useEffect(() => {
		(async () => {
			const response = await getMyPublishedProtocolsQuery();
			setProtocols(response.protocols.map(mapProtocolDetailsToObject));
			const linkedResponse = await getLinkedProtocolsQuery(data.protocol_id);
			setLinked(linkedResponse.protocols.map(mapProtocolDetailsToObject));
		})();
	}, [data?.protocol_id]);

	const saveLinks = async () => {
		const response = await updateLinkedProtocolsQuery(
			data.protocol_id,
			linked.map(p => p.id)
		);
	};

	const addLinkedProtocol = () => {
		if (!activeSelection) {
			return;
		}
		const protocolToLink = protocols.find(p => p.id === activeSelection);
		setLinked([...linked, protocolToLink]);
		setActiveSelection(null);
	};

	const removeLink = (id: number) => {
		setLinked(linked.filter(p => p.id !== id));
	};

	const currentProtocol = protocols.find(p => p.id == data.protocol_id);

	if (!currentProtocol) {
		return null;
	}

	return (
		<div className="LinkProtocolsModal">
			<div className="current">
				<label>{t("current_protocol")}</label>
				<p>
					{currentProtocol.title} ({currentProtocol.pct_id})
				</p>
			</div>
			<div className="linked">
				<label>{t("linked_protocols")}</label>
				<ul className="protocols">
					{linked.map(p => (
						<li key={p.id}>
							<p>{p.title}</p>
							<button className="danger small" onClick={() => removeLink(p.id)}>
								x
							</button>
						</li>
					))}
				</ul>
				<FlexWrapper>
					<select onChange={e => setActiveSelection(+e.target.value)}>
						<option value=""></option>
						{protocols
							.filter(
								p => p.id !== data.protocol_id && linked.every(_p => p.id !== _p.id)
							)
							.map(p => (
								<option key={p.id} value={p.id}>
									{p.title}
								</option>
							))}
					</select>
					<button className="primary small" onClick={addLinkedProtocol}>
						{t("add_linked_protocol")}
					</button>
				</FlexWrapper>
			</div>
			<div className="submit margin-20">
				<button onClick={saveLinks} className="primary">
					{t("save_links")}
				</button>
			</div>
		</div>
	);
};
