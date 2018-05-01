const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: './src/index.tsx',
    mode: 'production',
    output: {
        filename: 'static/js/bundle.[hash:8].js',
        path: path.resolve(__dirname, 'build')
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: 'source-map',

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: ['.ts', '.tsx', '.js', '.json']
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader',
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            },
            {
                test: /\.(png|jpg|gif)$/,
                loader: 'file-loader',
                options: {
                    name: 'static/media/[name].[hash:8].[ext]'
                }
            },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: 'source-map-loader',
                include: [
                    path.resolve(__dirname, 'src')
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            title: 'Mazenet',
            template: './public/index.html',
            minify: {
                removeComments: true
            }
        }),
        CopyWebpackPlugin([
            {
                from: 'public/',
                to: '[name].[ext]',
                test: /\.(png|json)$/
            }
        ]),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: 'static/css/[name].[hash:8].css',
            chunkFilename: 'static/css/[id].[hash:8].css'
        }),
        // Hack to make the following warning under `source-map` disappear.
        // `Critical dependency: require function is used in a way in which dependencies cannot be statically extracted`
        new webpack.ContextReplacementPlugin(/source-map/, /^$/)
    ],
    node: {
        fs: 'empty'
    }
};