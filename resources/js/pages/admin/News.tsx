import JoditEditor from "jodit-react";
import React, { useRef, useState, useEffect } from "react";
import { AdminPage } from "../../components/layout/admin/AdminPage";
import { Config } from "../../../../node_modules/jodit/types/config";
import { FormBlock } from "../../components/layout/FormBlock";
import { createNewsItemQuery } from "../../queries/news";
import { createNewsItemForm } from "../../data/forms/news";
import { RichTextField } from "../../components/forms/RichTextField";
import { TFormFieldName } from "../../typings/forms";

export const NewsPage: React.FC = () => {
	return (
		<AdminPage title="News">
			<FormBlock
				withoutMargin={true}
				form={createNewsItemForm}
				handleSubmit={createNewsItemQuery}
			></FormBlock>
		</AdminPage>
	);
};
