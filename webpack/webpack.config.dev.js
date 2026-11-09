const CopyPlugin = require("copy-webpack-plugin");
const webpack = require('webpack');
const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');

// Usage: webpack --config webpack/webpack.config.dev.js --env character=duck
module.exports = (env = {}) => {
    const character = env.character || 'duck';

    return {
        mode: 'development',
        devServer: {
            static: path.resolve(__dirname, '../dist'),
            port: 3000
        },
        devtool: 'inline-source-map',
        entry: {
            index: {
                import: './src/index.ts',
                dependOn: 'shared'
            },
            shared: 'pixi.js'
        },
        plugins: [
            new CopyPlugin({
                patterns: [
                    { from: "public/assets", to: "public/assets" },
                ],
            }),
            new HTMLWebpackPlugin({
                template: 'src/index.html',
                title: 'Game'
            }),
            new webpack.DefinePlugin({
                __CHARACTER__: JSON.stringify(character)
            })
        ],
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/
                }
            ]
        },
        resolve: {
            extensions: ['.ts', '.js']
        },
        output: {
            filename: '[name].application.js',
            path: path.resolve(__dirname, '../dist'),
            devtoolModuleFilenameTemplate: 'file:///[absolute-resource-path]'
        },
        cache: {
            type: 'filesystem'
        }
    };
};
