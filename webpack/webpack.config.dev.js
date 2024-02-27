const CopyPlugin = require("copy-webpack-plugin");
const webpack = require('webpack');
const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
    mode: 'development',
    devServer: {
        contentBase: 'dist',
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
                { from: "src", to: "dest" },
                { from: "public/assets", to: "public/assets" },
            ],
        }),
        new HTMLWebpackPlugin({
            template: 'src/index.html',
            title: 'Dino Game'
        }),
        // Work around for Buffer is undefined:
        // https://github.com/webpack/changelog-v5/issues/10
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer']
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
        extensions: ['.tsx', '.ts', '.js'],
        plugins: [
            new TsconfigPathsPlugin({
                configFile: './tsconfig.json',
                extensions: ['.ts']
            })
        ]
    },
    output: {
        filename: '[name].application.js',
        path: path.resolve(__dirname, '../dist'),
        devtoolModuleFilenameTemplate: 'file:///[absolute-resource-path]'
    },
    resolve: {
        extensions: [ '.ts', '.js' ],
        fallback: {
            "buffer": require.resolve("buffer")
        }
    },
    cache: {
        type: 'filesystem'
    }
}
