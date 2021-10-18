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

const App: React.FC = () => {
	const [translationStore] = useState(new TranslationStore());
	const [modalStore] = useState(new ModalStore());

	return (
		<TranslationStoreProvider store={translationStore}>
			<ModalStoreProvider store={modalStore}>
				<Router>
					<Switch>
						<Route path="/" exact={true}>
							<HomePage />
						</Route>
						<Route path="/about-us" exact={true}>
							<AboutUsPage />
						</Route>
						<Route path="/contact" exact={true}>
							<ContactPage />
						</Route>
					</Switch>
				</Router>
			</ModalStoreProvider>
		</TranslationStoreProvider>
	);
};

render(<App />, document.getElementById("app"));
