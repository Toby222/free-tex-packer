const path = require("path");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const argv = require("optimist").argv;

const entry = ["babel-polyfill", "./src/client/index"];

const plugins = [];

const output = argv.build ? "web/static/js/index.js" : "static/js/index.js";
const NODE_ENV = argv.build ? "production" : "development";
const devtool = argv.build ? "source-map" : "eval-source-map";

if (!argv.build) {
	entry.push("webpack-dev-server/client?http://localhost:4000");
	plugins.push(
		new CopyWebpackPlugin([{ from: "src/client/resources", to: "./" }]),
	);
} else {
	plugins.push(
		new CopyWebpackPlugin([{ from: "src/client/resources", to: "web/" }]),
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
};

module.exports = config;
