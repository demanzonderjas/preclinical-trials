import React, { useState } from "react";
import { render } from "react-dom";
import TranslationStoreProvider from "./contexts/TranslationContext";
import { TranslationStore } from "./stores/TranslationStore";

import { HomePage } from "./pages/Home";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { AboutPCTPage } from "./pages/AboutUs";
import ModalStoreProvider from "./contexts/ModalContext";
import { ModalStore } from "./stores/ModalStore";
import { ContactPage } from "./pages/Contact";
import { CreateAccountPage } from "./pages/CreateAccount";
import ScrollToTop from "./components/base/ScrollToTop";
import { AddNewsItemPage } from "./pages/admin/news/AddNewsItem";
import { NewsPage as AdminNewsPage } from "./pages/admin/news/News";
import { NewsPage } from "./pages/News";
import { HelpPage } from "./pages/Help";
import { DisclaimerPage } from "./pages/Disclaimer";
import { Modal } from "./components/layout/Modal";
import { ResetPasswordPage } from "./pages/ResetPassword";
import { DashboardPage } from "./pages/dashboard/Dashboard";
import { AddProtocolPage } from "./pages/dashboard/AddProtocol";
import { EditProtocolPage } from "./pages/dashboard/EditProtocol";
import { ManageProtocolsPage } from "./pages/dashboard/ManageProtocols";
import { TeamPage } from "./pages/Team";
import { AdvisoryBoardPage } from "./pages/AdvisoryBoard";
import { ViewProtocolPage } from "./pages/ViewProtocol";
import { SearchDatabasePage } from "./pages/SearchDatabase";
import { UserStoreProvider } from "./contexts/UserContext";
import { UserStore } from "./stores/UserStore";
import { ProtocolsPage } from "./pages/admin/Protocols";
import { AdminIndexPage } from "./pages/admin/AdminIndex";
import { PagesPage } from "./pages/admin/pages/Pages";
import { StatsPage } from "./pages/admin/Stats";
import { NewsItemPage } from "./pages/NewsItem";
import { EditNewsItemPage } from "./pages/admin/news/EditNewsitem";
import { AddFAQItemPage } from "./pages/admin/faq/AddFAQItem";
import { AdminFAQPage } from "./pages/admin/faq/FAQ";
import { EditFAQItemPage } from "./pages/admin/faq/EditFAQitem";
import { EditPagePage } from "./pages/admin/pages/EditPage";
import { Loader } from "./components/layout/Loader";
import { BackgroundInfoPage } from "./pages/BackgroundInfo";
import { AdminViewProtocolPage } from "./pages/admin/protocols/ViewProtocol";
import { AmbassadorsPage } from "./pages/Ambassadors";
import { ProfilePage } from "./pages/dashboard/Profile";
import { EditProfilePage } from "./pages/dashboard/EditProfile";

const App: React.FC = () => {
	const [translationStore] = useState(new TranslationStore());
	const [modalStore] = useState(new ModalStore());
	const [userStore] = useState(new UserStore());

	return (
		<TranslationStoreProvider store={translationStore}>
			<UserStoreProvider store={userStore}>
				<ModalStoreProvider store={modalStore}>
					<Router>
						<ScrollToTop />
						<Switch>
							<Route path="/" exact={true}>
								<HomePage />
							</Route>

							<Route path="/about-pct" exact={true}>
								<AboutPCTPage />
							</Route>
							<Route path="/about-pct/team" exact={true}>
								<TeamPage />
							</Route>
							<Route path="/about-pct/advisory-board" exact={true}>
								<AdvisoryBoardPage />
							</Route>
							<Route path="/about-pct/background-information" exact={true}>
								<BackgroundInfoPage />
							</Route>
							<Route path="/about-pct/ambassadors" exact={true}>
								<AmbassadorsPage />
							</Route>
							<Route path="/database" exact={true}>
								<SearchDatabasePage />
							</Route>
							<Route path="/database/view-protocol/:protocol_id" exact={true}>
								<ViewProtocolPage />
							</Route>
							<Route path="/news" exact={true}>
								<NewsPage />
							</Route>
							<Route path="/news/view-item/:news_item_id" exact={true}>
								<NewsItemPage />
							</Route>
							<Route path="/help" exact={true}>
								<HelpPage />
							</Route>
							<Route path="/create-account" exact={true}>
								<CreateAccountPage />
							</Route>
							<Route path="/dashboard" exact={true}>
								<DashboardPage />
							</Route>
							<Route path="/dashboard/add-protocol" exact={true}>
								<AddProtocolPage />
							</Route>
							<Route path="/dashboard/manage-protocols">
								<ManageProtocolsPage />
							</Route>
							<Route path="/dashboard/database">
								<SearchDatabasePage />
							</Route>
							<Route path="/dashboard/edit-protocol/:protocol_id">
								<EditProtocolPage />
							</Route>
							<Route path="/dashboard/profile">
								<ProfilePage />
							</Route>
							<Route path="/dashboard/edit-profile">
								<EditProfilePage />
							</Route>
							<Route path="/reset-password/:token">
								<ResetPasswordPage />
							</Route>
							<Route path="/contact" exact={true}>
								<ContactPage />
							</Route>
							<Route path="/disclaimer" exact={true}>
								<DisclaimerPage />
							</Route>
							<Route path="/admin" exact={true}>
								<AdminIndexPage />
							</Route>
							<Route path="/admin/protocols" exact={true}>
								<ProtocolsPage />
							</Route>
							<Route path="/admin/protocols/:protocol_id">
								<AdminViewProtocolPage />
							</Route>
							<Route path="/admin/news" exact={true}>
								<AdminNewsPage />
							</Route>
							<Route path="/admin/news/add-item" exact={true}>
								<AddNewsItemPage />
							</Route>
							<Route path="/admin/news/edit-item/:news_item_id">
								<EditNewsItemPage />
							</Route>
							<Route path="/admin/faq" exact={true}>
								<AdminFAQPage />
							</Route>
							<Route path="/admin/faq/add-item" exact={true}>
								<AddFAQItemPage />
							</Route>
							<Route path="/admin/faq/edit-item/:faq_item_id" exact={true}>
								<EditFAQItemPage />
							</Route>
							<Route path="/admin/pages" exact={true}>
								<PagesPage />
							</Route>
							<Route path="/admin/pages/edit-item/:page_id" exact={true}>
								<EditPagePage />
							</Route>
							<Route path="/admin/stats" exact={true}>
								<StatsPage />
							</Route>
						</Switch>
						<Modal />
						<Loader />
					</Router>
				</ModalStoreProvider>
			</UserStoreProvider>
		</TranslationStoreProvider>
	);
};

render(<App />, document.getElementById("app"));
