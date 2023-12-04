const CopyPlugin = require("copy-webpack-plugin");
const HTMLWebpackPlugin = require('html-webpack-plugin')

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
                { from: "assets", to: "assets" },
            ],
        }),
        new HTMLWebpackPlugin({
            template: 'src/index.html',
            title: 'Dino Game'
        })
    ]
}
