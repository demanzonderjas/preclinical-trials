import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { ExpandableText } from "../components/layout/ExpandableText";
import { PrimaryHeaderPageWithSubMenu, PageWithSubmenu } from "../components/layout/Page";
import { getFAQ } from "../queries/faq";
import { TFaqCategory, TFaqItem, TPublishStatus } from "../typings/faq";
import { TSubMenu } from "../typings/layout";

export const HelpPage: React.FC = () => {
	const [faqCategories, setFaqCategories] = useState<TFaqCategory[]>([]);
	const [activeCategory, setActiveCategory] = useState<TFaqCategory>(null);

	useEffect(() => {
		(async () => {
			const { categories } = await getFAQ();
			setFaqCategories(categories);
			setActiveCategory(categories[0]);
		})();
	}, []);

	const subMenu: TSubMenu = {
		items: faqCategories.map(fc => ({ text: fc.name, target: fc.id })),
		handleClick: (target: number) =>
			setActiveCategory(faqCategories.find(fc => fc.id == target))
	};

	return (
		<PrimaryHeaderPageWithSubMenu title="Help">
			<PageWithSubmenu subMenu={subMenu}>
				<div className="HelpPage">
					{activeCategory?.faq_items
						.filter(item => item.status !== TPublishStatus.Draft)
						.map(item => (
							<ExpandableText key={item.id} header={item.title} body={item.content} />
						))}
				</div>
			</PageWithSubmenu>
		</PrimaryHeaderPageWithSubMenu>
	);
};
