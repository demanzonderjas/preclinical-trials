import React, { useEffect, useRef } from "react";
import { useTranslationStore } from "../../hooks/useTranslationStore";

export default function LapostaForm() {
	let lapostaRef = useRef(null);
	let { t } = useTranslationStore();
	useEffect(() => {
		const script = document.createElement("script");
		script.src = "https://embed.email-provider.eu/e/o1tdskschd-iafmluaiia.js";
		script.async = true;

		lapostaRef.current.appendChild(script);

		return () => {
			lapostaRef.current.removeChild(script);
		};
	}, []);

	return (
		<div
			className="border-bottom"
			style={{
				paddingBottom: "2rem",
				display: "flex",
				fontWeight: "bold",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				gap: "1rem",
				fontSize: "20px"
			}}
			ref={lapostaRef}
			id="laposta-form"
		></div>
	);
}
