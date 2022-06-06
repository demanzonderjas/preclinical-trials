import React, { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import { env } from "../../env";
import { getAmbassadorsQuery } from "../../queries/ambassadors";
import { Marker } from "./Marker";
import "mapbox-gl/dist/mapbox-gl.css";

export default function AmbassadorMap() {
	const [map, setMap] = useState<mapboxgl.Map>(null);
	const [ambassadors, setAmbassadors] = useState([]);

	useEffect(() => {
		(async () => {
			const response = await getAmbassadorsQuery();
			setAmbassadors(response.ambassadors);
		})();
	}, []);

	useEffect(() => {
		if (!ambassadors.length) {
			return;
		}
		mapboxgl.accessToken = env.MAPBOX_API_KEY;
		const map = new mapboxgl.Map({
			container: "map",
			style: "mapbox://styles/mapbox/streets-v11",
			zoom: 1
		});
		setMap(map);
	}, [ambassadors]);

	return (
		<div className="MapboxMap">
			<div id="map" style={{ height: "70vh", width: "70vw" }}></div>
			{ambassadors.map(ambassador => (
				<Marker key={ambassador.id} map={map} ambassador={ambassador} />
			))}
		</div>
	);
}
