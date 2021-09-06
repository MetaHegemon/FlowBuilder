const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'bundle.js'
    },
    performance: {
        maxEntrypointSize: 1024000,
        maxAssetSize: 1024000
    },
    devServer: {
        compress: true,
        port: 9000,
        hot: true
    },
    devtool: 'source-map',
    plugins: [new HtmlWebpackPlugin()]
}
