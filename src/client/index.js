import Controller from "platform/Controller";
import React from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import APP from "./APP";
import { GLOBAL_EVENT, Observer } from "./Observer";
import languages from "./resources/static/localization/languages.json";
import MainLayout from "./ui/MainLayout.jsx";
import I18 from "./utils/I18";
import Storage from "./utils/Storage";

let app = null;

const STORAGE_LANGUAGE_KEY = "language";

function run() {
	Controller.init();
	loadLocalization();
}

function loadLocalization() {
	for (let i = 1; i < languages.length; i++) {
		I18.supportedLanguages.push(languages[i].lang);
	}
	I18.path = "static/localization";
	I18.init(Storage.load(STORAGE_LANGUAGE_KEY, false));

	app = new APP();

	I18.load(renderLayout);

	Observer.on(GLOBAL_EVENT.CHANGE_LANG, setLocale);
}

function renderLayout() {
	Controller.updateLocale();
	const container = document.getElementById("root");
	const root = createRoot(container);
	const mainLayout = React.createElement(MainLayout);
	root.render(mainLayout);
}

function setLocale(locale) {
	if (!MainLayout.instance) return;

	I18.init(locale);
	I18.load(() => {
		Storage.save(STORAGE_LANGUAGE_KEY, I18.currentLocale);
		Controller.updateLocale();
		MainLayout.instance.forceUpdate();
	});
}

window.addEventListener("load", run, false);
