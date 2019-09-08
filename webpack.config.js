const path = require("path");

module.exports = {
    entry: path.resolve(__dirname, "./source/index.js"),

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: "babel-loader"
            }
        ]
    },

    output: {
        filename: "adframe.js",
        path: path.resolve(__dirname, "./dist"),
        libraryTarget: "commonjs2"
    }
};
