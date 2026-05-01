const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const prodBuild = process.argv.includes("build")

const entry = ["babel-polyfill", "./src/client/index"];

const plugins = [];

const output = prodBuild ? "web/static/js/index.js" : "static/js/index.js";
const NODE_ENV = prodBuild ? "production" : "development";
const devtool = prodBuild ? "source-map" : "eval-source-map";

if (prodBuild) {
	plugins.push(
		new CopyWebpackPlugin({
			patterns: [{ from: "src/client/resources", to: "web/" }]
		}),
	);
} else {
	entry.push("webpack-dev-server/client?http://localhost:4000");
	plugins.push(
		new CopyWebpackPlugin({
			patterns: [{ from: "src/client/resources", to: "./" }]
		}),
	);
}

const config = {
	plugins,
	entry,
	devtool,
	output: {
		path: __dirname + "/dist",
		filename: output,
	},
	mode: NODE_ENV,
	module: {
		noParse: /.*[/\\]bin[/\\].+\.js/,
		rules: [
			{
				test: /.jsx?$/,
				include: [path.resolve(__dirname, "src")],
				use: [
					{
						loader: "babel-loader",
						options: { presets: ["@babel/preset-react", "@babel/preset-env"] },
					},
				],
			},
			{
				test: /\.js$/,
				include: [path.resolve(__dirname, "src")],
				use: [
					{
						loader: "babel-loader",
						options: { presets: ["@babel/preset-env"] },
					},
				],
			},
			{
				test: /\.(html|htm)$/,
				use: [{ loader: "dom" }],
			},
		],
	},
};

config.resolve = {
	alias: { platform: path.resolve(__dirname, "./src/client/platform/web") },
	fallback: {
		timers: require.resolve("timers-browserify"),
		stream: require.resolve("stream-browserify"),
		buffer: require.resolve("buffer/"),
	},
};

module.exports = config;
