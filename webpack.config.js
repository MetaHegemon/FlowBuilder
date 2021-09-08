const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/js/index.js',
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
        ],
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
    plugins: [
        new HtmlWebpackPlugin({
            title: 'FlowBuilder',
            template: './src/index.html'
        }
    )]
}
