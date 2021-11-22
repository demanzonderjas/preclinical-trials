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
import { DatabasePage } from "./pages/Database";
import { NewsPage } from "./pages/News";
import { FAQPage } from "./pages/FAQ";
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

const App: React.FC = () => {
	const [translationStore] = useState(new TranslationStore());
	const [modalStore] = useState(new ModalStore());

	return (
		<TranslationStoreProvider store={translationStore}>
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
						<Route path="/database" exact={true}>
							<DatabasePage />
						</Route>
						<Route path="/database/view-protocol/:protocol_id" exact={true}>
							<ViewProtocolPage />
						</Route>
						<Route path="/news" exact={true}>
							<NewsPage />
						</Route>
						<Route path="/faq" exact={true}>
							<FAQPage />
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
						<Route path="/dashboard/edit-protocol/:protocol_id">
							<EditProtocolPage />
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
					</Switch>
					<Modal />
				</Router>
			</ModalStoreProvider>
		</TranslationStoreProvider>
	);
};

render(<App />, document.getElementById("app"));
