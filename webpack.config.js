const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// 👇 Detect if Vercel (or you) are running a production build
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

module.exports = {
  // 1. Dynamic Mode: Use 'production' on Vercel, 'development' locally
  mode: isProduction ? 'production' : 'development',
  
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
    assetModuleFilename: 'assets/[name][ext]',
  },

  // 2. FIX THE 12-MIN TIMEOUT: Only watch files locally, NEVER on Vercel production
  watch: !isProduction,

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
      // Minify only in production to optimize download speed
      minify: isProduction, 
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
  performance: {
    hints: isProduction ? false : 'warning', 
  }
};