import React, { useState } from "react";
import { render } from "react-dom";
import TranslationStoreProvider from "./contexts/TranslationContext";
import { TranslationStore } from "./stores/TranslationStore";

import { HomePage } from "./pages/Home";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { AboutUsPage } from "./pages/AboutUs";
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
						<Route path="/about-us" exact={true}>
							<AboutUsPage />
						</Route>
						<Route path="/database" exact={true}>
							<DatabasePage />
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
