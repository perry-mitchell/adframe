const path = require("path");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer")

const plugins = [];
if (process.env.ANALYZER === "bundle") {
    plugins.push(new BundleAnalyzerPlugin());
}

module.exports = {
    entry: path.resolve(__dirname, "./source/index.js"),

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: "babel-loader"
            },
            {
                test: /\.(html|css)$/,
                use: "raw-loader"
            }
        ]
    },

    output: {
        filename: "adframe.js",
        path: path.resolve(__dirname, "./dist"),
        libraryTarget: "commonjs2"
    },

    plugins
};
