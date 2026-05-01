import FileSystem from "platform/FileSystem";
import React from "react";
import ReactDOM from "react-dom";
import exporters, { getExporterByType } from "../exporters";
import filters, { getFilterByType } from "../filters";
import { GLOBAL_EVENT, Observer } from "../Observer";
import packers, { getPackerByType } from "../packers";
import I18 from "../utils/I18";
import Storage from "../utils/Storage";

const STORAGE_OPTIONS_KEY = "pack-options";
const STORAGE_CUSTOM_EXPORTER_KEY = "custom-exporter";

let INSTANCE = null;

class PackProperties extends React.Component {
	constructor(props) {
		super(props);

		INSTANCE = this;

		this.onPackerChange = this.onPackerChange.bind(this);
		this.onPropChanged = this.onPropChanged.bind(this);
		this.onExporterChanged = this.onExporterChanged.bind(this);
		this.onExporterPropChanged = this.onExporterPropChanged.bind(this);
		this.forceUpdate = this.forceUpdate.bind(this);
		this.selectSavePath = this.selectSavePath.bind(this);

		this.packOptions = this.loadOptions();
		this.loadCustomExporter();

		this.state = { packer: this.packOptions.packer };
	}

	static get i() {
		return INSTANCE;
	}

	setOptions(data) {
		this.packOptions = this.applyOptionsDefaults(data);
		this.saveOptions();
		this.refreshPackOptions();
		this.emitChanges();
	}

	loadCustomExporter() {
		const data = Storage.load(STORAGE_CUSTOM_EXPORTER_KEY);
		if (data) {
			const exporter = getExporterByType("custom");
			exporter.allowTrim = data.allowTrim;
			exporter.allowRotation = data.allowRotation;
			exporter.fileExt = data.fileExt;
			exporter.content = data.content;
		}
	}

	loadOptions() {
		return this.applyOptionsDefaults(Storage.load(STORAGE_OPTIONS_KEY));
	}

	applyOptionsDefaults(data) {
		if (!data) data = {};

		data.textureName = data.textureName || "texture";
		data.textureFormat = data.textureFormat || "png";
		data.removeFileExtension =
			data.removeFileExtension === undefined ? false : data.removeFileExtension;
		data.prependFolderName =
			data.prependFolderName === undefined ? true : data.prependFolderName;
		data.scale = data.scale || 1;
		data.filter = getFilterByType(data.filter) ? data.filter : filters[0].type;
		data.exporter = getExporterByType(data.exporter)
			? data.exporter
			: exporters[0].type;
		data.base64Export =
			data.base64Export === undefined ? false : data.base64Export;
		data.tinify = data.tinify === undefined ? false : data.tinify;
		data.tinifyKey = data.tinifyKey === undefined ? "" : data.tinifyKey;
		data.fileName = data.fileName || "pack-result";
		data.savePath = data.savePath || "";
		data.width = data.width === undefined ? 2048 : data.width;
		data.height = data.height === undefined ? 2048 : data.height;
		data.fixedSize = data.fixedSize === undefined ? false : data.fixedSize;
		data.powerOfTwo = data.powerOfTwo === undefined ? false : data.powerOfTwo;
		data.padding = data.padding === undefined ? 0 : data.padding;
		data.extrude = data.extrude === undefined ? 0 : data.extrude;
		data.allowRotation =
			data.allowRotation === undefined ? true : data.allowRotation;
		data.allowTrim = data.allowTrim === undefined ? true : data.allowTrim;
		data.trimMode = data.trimMode === undefined ? "trim" : data.trimMode;
		data.alphaThreshold = data.alphaThreshold || 0;
		data.detectIdentical =
			data.detectIdentical === undefined ? true : data.detectIdentical;
		data.packer = getPackerByType(data.packer) ? data.packer : packers[0].type;

		let methodValid = false;
		const packer = getPackerByType(data.packer);
		const packerMethods = Object.keys(packer.methods);
		for (const method of packerMethods) {
			if (method == data.packerMethod) {
				methodValid = true;
				break;
			}
		}

		if (!methodValid) data.packerMethod = packerMethods[0];

		return data;
	}

	saveOptions() {
		Storage.save(STORAGE_OPTIONS_KEY, this.packOptions);
	}

	componentDidMount() {
		this.updateEditCustomTemplateButton();
		this.emitChanges();
	}

	updatePackOptions() {
		const data = {};

		data.textureName = this.textureName.value;
		data.textureFormat = this.textureFormat.value;
		data.removeFileExtension = this.removeFileExtension.checked;
		data.prependFolderName = this.prependFolderName.checked;
		data.base64Export = this.base64Export.checked;
		data.tinify = this.tinify.checked;
		data.tinifyKey = this.tinifyKey.value;
		data.scale = Number(this.scale.value);
		data.filter = this.filter.value;
		data.exporter = this.exporter.value;
		data.fileName = this.fileName.value;
		data.savePath = this.savePath.value;
		data.width = Number(this.width.value) || 0;
		data.height = Number(this.height.value) || 0;
		data.fixedSize = this.fixedSize.checked;
		data.powerOfTwo = this.powerOfTwo.checked;
		data.padding = Number(this.padding.value) || 0;
		data.extrude = Number(this.extrude.value) || 0;
		data.allowRotation = this.allowRotation.checked;
		data.allowTrim = this.allowTrim.checked;
		data.trimMode = this.trimMode.value;
		data.alphaThreshold = this.alphaThreshold.value;
		data.detectIdentical = this.detectIdentical;
		data.packer = this.packer.value;
		data.packerMethod = this.packerMethod.value;

		this.packOptions = this.applyOptionsDefaults(data);
	}

	refreshPackOptions() {
		this.textureName.value = this.packOptions.textureName;
		this.textureFormat.value = this.packOptions.textureFormat;
		this.removeFileExtension.checked = this.packOptions.removeFileExtension;
		this.prependFolderName.checked = this.packOptions.prependFolderName;
		this.base64Export.checked = this.packOptions.base64Export;
		this.tinify.checked = this.packOptions.tinify;
		this.tinifyKey.value = this.packOptions.tinifyKey;
		this.scale.value = Number(this.packOptions.scale);
		this.filter.value = this.packOptions.filter;
		this.exporter.value = this.packOptions.exporter;
		this.fileName.value = this.packOptions.fileName;
		this.savePath.value = this.packOptions.savePath;
		this.width.value = Number(this.packOptions.width) || 0;
		this.height.value = Number(this.packOptions.height) || 0;
		this.fixedSize.checked = this.packOptions.fixedSize;
		this.powerOfTwo.checked = this.packOptions.powerOfTwo;
		this.padding.value = Number(this.packOptions.padding) || 0;
		this.extrude.value = Number(this.packOptions.extrude) || 0;
		this.allowRotation.checked = this.packOptions.allowRotation;
		this.allowTrim.checked = this.packOptions.allowTrim;
		this.trimMode.value = this.packOptions.trimMode;
		this.alphaThreshold.value = this.packOptions.alphaThreshold || 0;
		this.detectIdenticalRef.checked = this.packOptions.detectIdentical;
		this.packer.value = this.packOptions.packer;
		this.packerMethod.value = this.packOptions.packerMethod;
	}

	getPackOptions() {
		const data = Object.assign({}, this.packOptions);
		data.exporter = getExporterByType(data.exporter);
		data.packer = getPackerByType(data.packer);
		return data;
	}

	emitChanges() {
		Observer.emit(GLOBAL_EVENT.PACK_OPTIONS_CHANGED, this.getPackOptions());
	}

	onPackerChange(e) {
		this.setState({ packer: e.target.value });
		this.onPropChanged();
	}

	onPropChanged() {
		this.updatePackOptions();
		this.saveOptions();

		this.emitChanges();
	}

	onExporterChanged() {
		const exporter = getExporterByType(this.exporter.value);
		const allowTrimInput = this.allowTrim;
		const allowRotationInput = this.allowRotation;

		const doRefresh =
			allowTrimInput.checked !== exporter.allowTrim ||
			allowRotationInput.checked !== exporter.allowRotation;

		allowTrimInput.checked = exporter.allowTrim;
		allowRotationInput.checked = exporter.allowRotation;

		this.updateEditCustomTemplateButton();

		this.onExporterPropChanged();
		if (doRefresh) this.onPropChanged();
	}

	updateEditCustomTemplateButton() {
		const exporter = getExporterByType(this.exporter.value);
		this.editCustomFormat.style.visibility =
			exporter.type === "custom" ? "visible" : "hidden";
	}

	onExporterPropChanged() {
		this.updatePackOptions();
		this.saveOptions();

		Observer.emit(GLOBAL_EVENT.PACK_EXPORTER_CHANGED, this.getPackOptions());
	}

	forceUpdate(e) {
		if (e) {
			const key = e.keyCode || e.which;
			if (key === 13) this.onPropChanged();
		}
	}

	startExport() {
		Observer.emit(GLOBAL_EVENT.START_EXPORT);
	}

	editCustomExporter() {
		Observer.emit(GLOBAL_EVENT.SHOW_EDIT_CUSTOM_EXPORTER);
	}

	selectSavePath() {
		const dir = FileSystem.selectFolder();
		if (dir) {
			this.savePath.value = dir;
			this.onExporterPropChanged();
		}
	}

	render() {
		const exporter = getExporterByType(this.packOptions.exporter);
		const allowRotation =
			this.packOptions.allowRotation && exporter.allowRotation;
		const exporterRotationDisabled = exporter.allowRotation ? "" : "disabled";
		const allowTrim = this.packOptions.allowTrim && exporter.allowTrim;
		const exporterTrimDisabled = exporter.allowTrim ? "" : "disabled";

		return (
			<div className="props-list back-white">
				<div className="pack-properties-containter">
					<table>
						<tbody>
							<tr title={I18.f("TEXTURE_NAME_TITLE")}>
								<td>{I18.f("TEXTURE_NAME")}</td>
								<td>
									<input
										ref={(textureName) => (this.textureName = textureName)}
										type="text"
										className="border-color-gray"
										defaultValue={this.packOptions.textureName}
										onBlur={this.onExporterPropChanged}
									/>
								</td>
								<td></td>
							</tr>
							<tr title={I18.f("TEXTURE_FORMAT_TITLE")}>
								<td>{I18.f("TEXTURE_FORMAT")}</td>
								<td>
									<select
										ref={(textureFormat) =>
											(this.textureFormat = textureFormat)
										}
										className="border-color-gray"
										defaultValue={this.packOptions.textureFormat}
										onChange={this.onExporterChanged}
									>
										<option value="png">png</option>
										<option value="jpg">jpg</option>
									</select>
								</td>
								<td></td>
							</tr>
							<tr title={I18.f("REMOVE_FILE_EXT_TITLE")}>
								<td>{I18.f("REMOVE_FILE_EXT")}</td>
								<td>
									<input
										ref={(removeFileExtension) =>
											(this.removeFileExtension = removeFileExtension)
										}
										className="border-color-gray"
										type="checkbox"
										defaultChecked={
											this.packOptions.removeFileExtension ? "checked" : ""
										}
										onChange={this.onExporterPropChanged}
									/>
								</td>
								<td></td>
							</tr>
							<tr title={I18.f("PREPEND_FOLDER_TITLE")}>
								<td>{I18.f("PREPEND_FOLDER")}</td>
								<td>
									<input
										ref={(prependFolderName) =>
											(this.prependFolderName = prependFolderName)
										}
										className="border-color-gray"
										type="checkbox"
										defaultChecked={
											this.packOptions.prependFolderName ? "checked" : ""
										}
										onChange={this.onExporterPropChanged}
									/>
								</td>
								<td></td>
							</tr>
							<tr title={I18.f("BASE64_EXPORT_TITLE")}>
								<td>{I18.f("BASE64_EXPORT")}</td>
								<td>
									<input
										ref={(base64Export) => (this.base64Export = base64Export)}
										className="border-color-gray"
										type="checkbox"
										defaultChecked={
											this.packOptions.base64Export ? "checked" : ""
										}
										onChange={this.onExporterPropChanged}
									/>
								</td>
								<td></td>
							</tr>
							<tr title={I18.f("TINIFY_TITLE")}>
								<td>{I18.f("TINIFY")}</td>
								<td>
									<input
										ref={(tinify) => (this.tinify = tinify)}
										className="border-color-gray"
										type="checkbox"
										defaultChecked={this.packOptions.tinify ? "checked" : ""}
										onChange={this.onExporterPropChanged}
									/>
								</td>
								<td></td>
							</tr>
							<tr title={I18.f("TINIFY_KEY_TITLE")}>
								<td>{I18.f("TINIFY_KEY")}</td>
								<td>
									<input
										ref={(tinifyKey) => (this.tinifyKey = tinifyKey)}
										type="text"
										className="border-color-gray"
										defaultValue={this.packOptions.tinifyKey}
										onBlur={this.onExporterPropChanged}
									/>
								</td>
								<td></td>
							</tr>
							<tr title={I18.f("SCALE_TITLE")}>
								<td>{I18.f("SCALE")}</td>
								<td>
									<input
										ref={(scale) => (this.scale = scale)}
										type="number"
										min="0"
										className="border-color-gray"
										defaultValue={this.packOptions.scale}
										onBlur={this.onPropChanged}
									/>
								</td>
								<td></td>
							</tr>
							<tr title={I18.f("FILTER_TITLE")}>
								<td>{I18.f("FILTER")}</td>
								<td>
									<select
										ref={(filter) => (this.filter = filter)}
										className="border-color-gray"
										onChange={this.onExporterChanged}
										defaultValue={this.packOptions.filter}
									>
										{filters.map((node) => {
											return (
												<option
													key={"filter-" + node.type}
													defaultValue={node.type}
												>
													{node.type}
												</option>
											);
										})}
									</select>
								</td>
								<td></td>
							</tr>
							<tr title={I18.f("FORMAT_TITLE")}>
								<td>{I18.f("FORMAT")}</td>
								<td>
									<select
										ref={(exporter) => (this.exporter = exporter)}
										className="border-color-gray"
										onChange={this.onExporterChanged}
										defaultValue={this.packOptions.exporter}
									>
										{exporters.map((node) => {
											return (
												<option
													key={"exporter-" + node.type}
													defaultValue={node.type}
												>
													{node.type}
												</option>
											);
										})}
									</select>
								</td>
								<td>
									<div
										className="edit-btn back-800"
										ref={(editCustomFormat) =>
											(this.editCustomFormat = editCustomFormat)
										}
										onClick={this.editCustomExporter}
									></div>
								</td>
							</tr>
							<tr title={I18.f("FILE_NAME_TITLE")}>
								<td>{I18.f("FILE_NAME")}</td>
								<td>
									<input
										ref={(fileName) => (this.fileName = fileName)}
										className="border-color-gray"
										type="text"
										defaultValue={this.packOptions.fileName}
										onBlur={this.onExporterPropChanged}
									/>
								</td>
								<td></td>
							</tr>
							<tr title={I18.f("SAVE_PATH_TITLE")} style={{ display: "none" }}>
								<td>{I18.f("SAVE_PATH")}</td>
								<td>
									<input
										ref={(savePath) => (this.savePath = savePath)}
										className="border-color-gray"
										type="text"
										defaultValue={this.packOptions.savePath}
										onBlur={this.onExporterPropChanged}
									/>
								</td>
								<td>
									<div
										className="folder-btn back-800"
										onClick={this.selectSavePath}
									></div>
								</td>
							</tr>
							<tr>
								<td colSpan="3" className="center-align">
									<div
										className="btn back-800 border-color-gray color-white"
										onClick={this.startExport}
									>
										{I18.f("EXPORT")}
									</div>
								</td>
							</tr>

							<tr title={I18.f("WIDTH_TITLE")}>
								<td>{I18.f("WIDTH")}</td>
								<td>
									<input
										ref={(width) => (this.width = width)}
										type="number"
										min="0"
										className="border-color-gray"
										defaultValue={this.packOptions.width}
										onBlur={this.onPropChanged}
										onKeyDown={this.forceUpdate}
									/>
								</td>
								<td></td>
							</tr>
							<tr title={I18.f("HEIGHT_TITLE")}>
								<td>{I18.f("HEIGHT")}</td>
								<td>
									<input
										ref={(height) => (this.height = height)}
										type="number"
										min="0"
										className="border-color-gray"
										defaultValue={this.packOptions.height}
										onBlur={this.onPropChanged}
										onKeyDown={this.forceUpdate}
									/>
								</td>
								<td></td>
							</tr>
							<tr title={I18.f("FIXED_SIZE_TITLE")}>
								<td>{I18.f("FIXED_SIZE")}</td>
								<td>
									<input
										ref={(fixedSize) => (this.fixedSize = fixedSize)}
										type="checkbox"
										className="border-color-gray"
										onChange={this.onPropChanged}
										defaultChecked={this.packOptions.fixedSize ? "checked" : ""}
									/>
								</td>
								<td></td>
							</tr>
							<tr title={I18.f("POWER_OF_TWO_TITLE")}>
								<td>{I18.f("POWER_OF_TWO")}</td>
								<td>
									<input
										ref={(powerOfTwo) => (this.powerOfTwo = powerOfTwo)}
										type="checkbox"
										className="border-color-gray"
										onChange={this.onPropChanged}
										defaultChecked={
											this.packOptions.powerOfTwo ? "checked" : ""
										}
									/>
								</td>
								<td></td>
							</tr>
							<tr title={I18.f("PADDING_TITLE")}>
								<td>{I18.f("PADDING")}</td>
								<td>
									<input
										ref={(padding) => (this.padding = padding)}
										type="number"
										className="border-color-gray"
										defaultValue={this.packOptions.padding}
										min="0"
										onInput={this.onPropChanged}
										onKeyDown={this.forceUpdate}
									/>
								</td>
								<td></td>
							</tr>
							<tr title={I18.f("EXTRUDE_TITLE")}>
								<td>{I18.f("EXTRUDE")}</td>
								<td>
									<input
										ref={(extrude) => (this.extrude = extrude)}
										type="number"
										className="border-color-gray"
										defaultValue={this.packOptions.extrude}
										min="0"
										onInput={this.onPropChanged}
										onKeyDown={this.forceUpdate}
									/>
								</td>
								<td></td>
							</tr>
							<tr title={I18.f("ALLOW_ROTATION_TITLE")}>
								<td>{I18.f("ALLOW_ROTATION")}</td>
								<td>
									<input
										ref={(allowRotation) =>
											(this.allowRotation = allowRotation)
										}
										type="checkbox"
										className="border-color-gray"
										onChange={this.onPropChanged}
										defaultChecked={allowRotation ? "checked" : ""}
										disabled={exporterRotationDisabled}
									/>
								</td>
								<td></td>
							</tr>
							<tr title={I18.f("ALLOW_TRIM_TITLE")}>
								<td>{I18.f("ALLOW_TRIM")}</td>
								<td>
									<input
										ref={(allowTrim) => (this.allowTrim = allowTrim)}
										type="checkbox"
										className="border-color-gray"
										onChange={this.onPropChanged}
										defaultChecked={allowTrim ? "checked" : ""}
										disabled={exporterTrimDisabled}
									/>
								</td>
								<td></td>
							</tr>
							<tr title={I18.f("TRIM_MODE_TITLE")}>
								<td>{I18.f("TRIM_MODE")}</td>
								<td>
									<select
										ref={(trimMode) => (this.trimMode = trimMode)}
										className="border-color-gray"
										onChange={this.onPropChanged}
										defaultValue={this.packOptions.trimMode}
										disabled={
											exporterTrimDisabled || !this.packOptions.allowTrim
										}
									>
										<option value="trim">trim</option>
										<option value="crop">crop</option>
									</select>
								</td>
								<td></td>
							</tr>
							<tr title={I18.f("ALPHA_THRESHOLD_TITLE")}>
								<td>{I18.f("ALPHA_THRESHOLD")}</td>
								<td>
									<input
										ref={(alphaThreshold) =>
											(this.alphaThreshold = alphaThreshold)
										}
										type="number"
										className="border-color-gray"
										defaultValue={this.packOptions.alphaThreshold}
										min="0"
										max="255"
										onBlur={this.onPropChanged}
										onKeyDown={this.forceUpdate}
									/>
								</td>
								<td></td>
							</tr>
							<tr title={I18.f("DETECT_IDENTICAL_TITLE")}>
								<td>{I18.f("DETECT_IDENTICAL")}</td>
								<td>
									<input
										ref={(detectIdenticalRef) =>
											(this.detectIdenticalRef = detectIdenticalRef)
										}
										type="checkbox"
										className="border-color-gray"
										onChange={this.onPropChanged}
										defaultChecked={
											this.packOptions.detectIdentical ? "checked" : ""
										}
									/>
								</td>
								<td></td>
							</tr>
							<tr title={I18.f("PACKER_TITLE")}>
								<td>{I18.f("PACKER")}</td>
								<td>
									<select
										ref={(packer) => (this.packer = packer)}
										className="border-color-gray"
										onChange={this.onPackerChange}
										defaultValue={this.packOptions.packer}
									>
										{packers.map((node) => {
											return (
												<option
													key={"packer-" + node.type}
													defaultValue={node.type}
												>
													{node.type}
												</option>
											);
										})}
									</select>
								</td>
								<td></td>
							</tr>
							<tr title={I18.f("PACKER_METHOD_TITLE")}>
								<td>{I18.f("PACKER_METHOD")}</td>
								<td>
									<PackerMethods
										ref={(packerMethod) => (this.packerMethod = packerMethod)}
										packer={this.state.packer}
										defaultMethod={this.packOptions.packerMethod}
										handler={this.onPropChanged}
									/>
								</td>
								<td></td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		);
	}
}

class PackerMethods extends React.Component {
	render() {
		const packer = getPackerByType(this.props.packer);

		if (!packer) {
			throw new Error("Unknown packer " + this.props.packer);
		}

		const items = [];

		const methods = Object.keys(packer.methods);
		for (const item of methods) {
			items.push(
				<option value={item} key={"packer-method-" + item}>
					{item}
				</option>,
			);
		}

		return (
			<select
				onChange={this.props.handler}
				className="border-color-gray"
				defaultValue={this.props.defaultMethod}
			>
				{items}
			</select>
		);
	}
}

export default PackProperties;
