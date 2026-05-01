const path = require("path");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const argv = require("optimist").argv;

const entry = ["babel-polyfill", "./src/client/index"];

const plugins = [];

let output = "static/js/index.js";

const NODE_ENV = argv.build ? "production" : "development";
const devtool = argv.build ? "source-map" : "eval-source-map";

plugins.push(
	new webpack.DefinePlugin({
		"process.env.NODE_ENV": JSON.stringify(NODE_ENV),
	}),
);

if (argv.build) {
	plugins.push(
		new CopyWebpackPlugin([{ from: "src/client/resources", to: "web/" }]),
	);

	output = "web/static/js/index.js";
} else {
	entry.push("webpack-dev-server/client?http://localhost:4000");
	plugins.push(
		new CopyWebpackPlugin([{ from: "src/client/resources", to: "./" }]),
	);
}

const config = {
	entry: entry,
	output: {
		path: __dirname + "/dist",
		filename: output,
	},
	devtool: devtool,
	target: "web",
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
	optimization: {
		minimize: false,
	},
	plugins: plugins,
};

config.resolve = {
	alias: { platform: path.resolve(__dirname, "./src/client/platform/web") },
};

module.exports = config;
