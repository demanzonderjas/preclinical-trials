// Legacy React 16 SPA, still serving every page that has not been rebuilt in the A2
// design yet. Build from this folder: npm run production (outputs to /public).
const mix = require("laravel-mix");

mix.setPublicPath("../../public");

mix.copyDirectory("../images", "../../public/images");
mix.sass("sass/app.scss", "css");
mix.ts("js/index.tsx", "js");
mix.webpackConfig({
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: "ts-loader",
				exclude: /node_modules/
			}
		]
	},
	output: { chunkFilename: "js/[name].js?id=[chunkhash]" },
	resolve: {
		extensions: [".ts", ".tsx", ".js", ".jsx"]
	}
});
