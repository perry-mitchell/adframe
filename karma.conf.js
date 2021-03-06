// Karma configuration
// Generated on Fri Feb 08 2019 15:39:48 GMT+0200 (Eastern European Standard Time)

const webpackConfig = require("./webpack.config.js");
delete webpackConfig.entry;
delete webpackConfig.output;
webpackConfig.mode = "development";

const { BROWSER = "chrome" } = process.env;
const browsers = [];
if (BROWSER === "chrome") {
    browsers.push("ChromeNoSecurity");
} else if (BROWSER === "firefox") {
    browsers.push("FirefoxHeadless");
}

module.exports = function(config) {
    config.set({
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: "",

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ["mocha"],

        // list of files / patterns to load in the browser
        files: [
            "source/**/*.js",
            "test/index.js",
            "test/specs/**/*.spec.js"
        ],

        // list of files / patterns to exclude
        exclude: [],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            "source/**/*.js": ["webpack", "coverage"],
            "test/index.js": ["webpack"],
            "test/specs/**/*.spec.js": ["webpack"]
        },

        webpack: webpackConfig,

        // test results reporter to use
        // possible values: "dots", "progress"
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ["progress", "coverage"],

        coverageReporter: {
            type: "text-summary",
            check: {
                global: {
                    statements: 55,
                    branches: 19,
                    functions: 60,
                    lines: 60
                }
            },
            watermarks: {
                statements: [ 50, 85 ],
                functions: [ 50, 85 ],
                branches: [ 50, 85 ],
                lines: [ 50, 85 ]
            }
        },

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        customLaunchers: {
            ChromeNoSecurity: {
                base: "Chrome",
                flags: ["--disable-web-security", "--headless", "--remote-debugging-port=9222"]
            },
            FirefoxHeadless: {
                base: "Firefox",
                flags: ["-headless"]
            }
        },

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers,

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    });
}
