import React, { useEffect, useState } from "react";
import { API } from "../../utils/api";
import { Image } from "../base/Image";

export const Loader: React.FC = () => {
	const [isLoading, setIsLoading] = useState(false);
	useEffect(() => {
		API.interceptors.request.use(
			config => {
				setIsLoading(true);
				return config;
			},
			error => {
				return Promise.reject(error);
			}
		);

		API.interceptors.response.use(
			config => {
				setTimeout(() => {
					setIsLoading(false);
				}, 500);
				return config;
			},
			error => {
				return Promise.reject(error);
			}
		);
	}, []);

	if (!isLoading) {
		return null;
	}

	return (
		<div className="Loader">
			<Image filename="logo-pct.jpg" />
		</div>
	);
};
