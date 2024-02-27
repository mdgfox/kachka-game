const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
module.exports = {
    mode: "production",
    entry: {
        index: {
            import: './src/index.ts',
            dependOn: 'pixi'
        },
        pixi: 'pixi.js'
    },
    output: {
        path: path.join(__dirname, "../dist_ext"),
        filename: "[name].js",
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: "public/assets",
                    to: "public/assets",
                },
                {
                    from: "public/icons",
                    to: "./icons"
                },
                {
                    from: "public/manifest.json",
                    to: "./manifest.json"
                },
                {
                    from: "public/template.html",
                    to: "./index.html"
                }
            ],
        }),
    ],
};
