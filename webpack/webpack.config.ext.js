const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = (env) => {
    const character = env.character;
    if (!character) {
        throw new Error('Please provide a --env character argument (e.g., --env character=duck)');
    }
    return {
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
                        from: path.resolve(__dirname, `../public/assets/${character}`),
                        to: path.resolve(__dirname, `../dist_ext/public/assets/${character}`),
                    },
                    {
                        from: path.resolve(__dirname, "../public/assets/sounds"),
                        to: path.resolve(__dirname, "../dist_ext/public/assets/sounds"),
                    },
                    {
                        from: path.resolve(__dirname, "../public/assets/PixelifySans.ttf"),
                        to: path.resolve(__dirname, "../dist_ext/public/assets/PixelifySans.ttf"),
                    },
                    {
                        from: path.resolve(__dirname, "../public/icons"),
                        to: path.resolve(__dirname, "../dist_ext/icons"),
                    },
                    {
                        from: path.resolve(__dirname, "../public/manifest.json"),
                        to: path.resolve(__dirname, "../dist_ext/manifest.json"),
                    },
                    {
                        from: path.resolve(__dirname, "../public/template.html"),
                        to: path.resolve(__dirname, "../dist_ext/index.html"),
                    }
                ],
            }),
        ],
    };
};
