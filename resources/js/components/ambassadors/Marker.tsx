import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { TAmbassador } from "../../typings/aboutUs";

export const Marker: React.FC<{ map: mapboxgl.Map; ambassador: TAmbassador }> = ({
	map,
	ambassador
}) => {
	const markerRef = useRef(null);

	useEffect(() => {
		if (!markerRef.current || !map) {
			return;
		}

		// create the popup
		const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
			`<strong>${ambassador.name}:</strong> ${ambassador.description}`
		);

		new mapboxgl.Marker(markerRef.current)
			.setLngLat([+ambassador.longitude, +ambassador.latitude])
			.setPopup(popup) // sets a popup on this marker
			.addTo(map);
	}, [map, markerRef.current]);

	return <div className="marker AmbassadorMarker" ref={markerRef}></div>;
};
