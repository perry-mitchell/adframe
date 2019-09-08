const path = require("path");

module.exports = {
    entry: path.resolve(__dirname, "./source/index.js"),

    module: {
        rules: [
            {
                test: /\.js$/,
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
