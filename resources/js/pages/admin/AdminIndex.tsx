import React from "react";
import { AdminPage } from "../../components/layout/admin/AdminPage";

export const AdminIndexPage: React.FC = () => {
	return (
		<AdminPage title="Welcome">
			<p>
				Here you can easily change the content of the preclinicaltrials.eu website and
				manage the status of the submitted protocols
			</p>
		</AdminPage>
	);
};
