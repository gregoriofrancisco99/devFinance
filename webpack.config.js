const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
    assetModuleFilename: 'assets/[name][ext]',
  },
  watch: true,
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist'),
    },
    port: 5000,
    open: true,
    hot: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(svg|png|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html',
      minify: false,
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/assets', to: 'assets' },
        { from: 'login.html', to: '' },
        { from: 'register.html', to: '' },
        { from: 'auth.css', to: '' },
      ],
    }),
  ],
};
