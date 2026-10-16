import React, { useState, useEffect } from "react";
import { AdminPage } from "../../components/layout/admin/AdminPage";
import { Filter } from "../../components/tables/Filter";
import { TableBlock } from "../../components/tables/TableBlock";
import { FilterStoreProvider } from "../../contexts/FilterStoreContext";
import { FilterStore } from "../../stores/FilterStore";
import { TDBProtocol } from "../../typings/protocols";
import { createAccountForm } from "../../data/forms/create-account";
import { usersTable } from "../../data/tables/users";
import { getUsersQuery } from "../../queries/admin";

export const UsersPage: React.FC = () => {
	const [users, setUsers] = useState<TDBProtocol[]>([]);
	const [filterStore] = useState(new FilterStore());

	useEffect(() => {
		(async () => {
			const response = await getUsersQuery();
			setUsers(response.users.reverse());
		})();
	}, []);

	return (
		<AdminPage title="Users">
			<FilterStoreProvider store={filterStore}>
				<Filter
					options={createAccountForm.fields
						.filter(f => f.useAsFilter)
						.map(f => f.filterLabel || f.id)}
				/>
				<TableBlock showTotal={true} rows={users} table={usersTable}></TableBlock>
			</FilterStoreProvider>
		</AdminPage>
	);
};
