import mustache from "mustache";
import React from "react";
import ReactDOM from "react-dom";
import appInfo from "../../../package.json";
import { getExporterByType } from "../exporters";
import { GLOBAL_EVENT, Observer } from "../Observer";
import I18 from "../utils/I18";
import Storage from "../utils/Storage";

const STORAGE_CUSTOM_EXPORTER_KEY = "custom-exporter";

class EditCustomExporter extends React.Component {
	constructor(props) {
		super(props);

		this.save = this.save.bind(this);
	}

	close() {
		Observer.emit(GLOBAL_EVENT.HIDE_EDIT_CUSTOM_EXPORTER);
	}

	save() {
		const exporter = getExporterByType("custom");

		const content = ReactDOM.findDOMNode(this.refs.content).value;
		const allowTrim = ReactDOM.findDOMNode(this.refs.allowTrim).checked;
		const allowRotation = ReactDOM.findDOMNode(this.refs.allowRotation).checked;
		const fileExt = ReactDOM.findDOMNode(this.refs.fileExt).value;

		try {
			mustache.parse(content);

			exporter.content = content;
			exporter.allowTrim = allowTrim;
			exporter.allowRotation = allowRotation;
			exporter.fileExt = fileExt;

			Storage.save(STORAGE_CUSTOM_EXPORTER_KEY, exporter);

			Observer.emit(GLOBAL_EVENT.HIDE_EDIT_CUSTOM_EXPORTER);
		} catch (e) {
			Observer.emit(
				GLOBAL_EVENT.SHOW_MESSAGE,
				I18.f("EXPORTER_ERROR", e.message),
			);
		}
	}

	render() {
		const exporter = getExporterByType("custom");

		return (
			<div className="edit-custom-exporter-shader">
				<div className="edit-custom-exporter-content">
					<div>
						<a
							href={appInfo.homepage}
							className="color-800"
							target="_blank"
							rel="noopener"
						>
							{I18.f("DOCUMENTATION")}
						</a>
					</div>

					<div>
						<textarea
							ref="content"
							className="edit-custom-exporter-data"
							defaultValue={exporter.content}
						></textarea>
					</div>

					<div>
						<b>{I18.f("ALLOW_TRIM")}</b>
						<input
							ref="allowTrim"
							className="border-color-gray"
							type="checkbox"
							defaultChecked={exporter.allowTrim ? "checked" : ""}
						/>

						<b>{I18.f("ALLOW_ROTATION")}</b>
						<input
							ref="allowRotation"
							className="border-color-gray"
							type="checkbox"
							defaultChecked={exporter.allowRotation ? "checked" : ""}
						/>

						<b>{I18.f("FILE_EXT")}</b>
						<input
							ref="fileExt"
							className="border-color-gray"
							type="text"
							defaultValue={exporter.fileExt}
						/>
					</div>

					<div className="edit-custom-exporter-controls">
						<div
							className="btn back-800 border-color-gray color-white"
							onClick={this.save}
						>
							{I18.f("SAVE")}
						</div>
						&nbsp;&nbsp;&nbsp;
						<div
							className="btn back-black border-color-gray color-white"
							onClick={this.close}
						>
							{I18.f("CANCEL")}
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default EditCustomExporter;
