import React from "react";
import appInfo from "../../../package.json";
import exporters from "../exporters";
import { GLOBAL_EVENT, Observer } from "../Observer";
import I18 from "../utils/I18";

class About extends React.Component {
	constructor(props) {
		super(props);
	}

	close() {
		Observer.emit(GLOBAL_EVENT.HIDE_ABOUT);
	}

	render() {
		return (
			<div className="about-shader">
				<div className="about-content">
					<div className="about-logo"></div>

					<div className="about-app-info">
						<span className="about-app-name">{appInfo.displayName}</span>
						<span className="about-app-version">{appInfo.version}</span>
					</div>

					<div>
						<table>
							<tbody>
								<tr>
									<td>
										<b>{I18.f("ABOUT_HOMEPAGE")}</b>
									</td>
									<td>
										<a
											href={appInfo.url}
											target="_blank"
											className="color-800"
											rel="noopener"
										>
											{appInfo.url}
										</a>
									</td>
								</tr>

								<tr>
									<td>
										<b>{I18.f("ABOUT_SOURCES")}</b>
									</td>
									<td>
										<a
											href={appInfo.homepage}
											target="_blank"
											className="color-800"
											rel="noopener"
										>
											{appInfo.homepage}
										</a>
									</td>
								</tr>

								<tr>
									<td>
										<b>{I18.f("ABOUT_BUGS")}</b>
									</td>
									<td>
										<a
											href={appInfo.bugs.url}
											target="_blank"
											className="color-800"
											rel="noopener"
										>
											{appInfo.bugs.url}
										</a>
									</td>
								</tr>

								<tr>
									<td>
										<b>{I18.f("ABOUT_APPS")}</b>
									</td>
									<td>
										<a
											href={appInfo.download}
											target="_blank"
											className="color-800"
											rel="noopener"
										>
											{appInfo.download}
										</a>
									</td>
								</tr>

								<tr>
									<td>
										<b>{I18.f("ABOUT_LIBS")}</b>
									</td>
									<td>
										<div>
											<a
												href="https://facebook.github.io/react"
												target="_blank"
												className="color-800"
												rel="noopener"
											>
												React
											</a>
										</div>
										<div>
											<a
												href="https://stuk.github.io/jszip"
												target="_blank"
												className="color-800"
												rel="noopener"
											>
												JSZip
											</a>
										</div>
										<div>
											<a
												href="https://github.com/eligrey/FileSaver.js"
												target="_blank"
												className="color-800"
												rel="noopener"
											>
												FileSaver.js
											</a>
										</div>
										<div>
											<a
												href="https://github.com/janl/mustache.js"
												target="_blank"
												className="color-800"
												rel="noopener"
											>
												mustache.js
											</a>
										</div>
										<div>
											<a
												href="https://github.com/06wj/MaxRectsBinPack"
												target="_blank"
												className="color-800"
												rel="noopener"
											>
												MaxRectsBinPack
											</a>
										</div>
										<div>
											<a
												href="https://www.npmjs.com/package/maxrects-packer"
												target="_blank"
												className="color-800"
												rel="noopener"
											>
												MaxRectsPacker
											</a>
										</div>
									</td>
								</tr>

								<tr>
									<td>
										<b>{I18.f("ABOUT_CONTRIBUTORS")}</b>
									</td>
									<td className={"contributors-list"}>
										{appInfo.contributors
											.map((contributor) => {
												return (
													<a
														key={"contributor-" + contributor.name}
														href={contributor.homepage}
														target="_blank"
														className="color-800"
														rel="noopener"
													>
														{contributor.name}
													</a>
												);
											})
											.reduce((prev, curr) => [prev, ", ", curr])}
									</td>
								</tr>
							</tbody>
						</table>
						<div className="about-controls">
							<div
								className="btn back-600 border-color-gray color-white"
								onClick={this.close}
							>
								{I18.f("OK")}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default About;
