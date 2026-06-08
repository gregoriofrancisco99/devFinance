const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

module.exports = {
  mode: isProduction ? 'production' : 'development',
  
  // 💡 MUDANÇA: Apenas um entry point centralizado
  entry: './src/index.js',
  
  devtool: isProduction ? false : 'eval-source-map', 

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js', // Nome fixo simplificado
    chunkFilename: '[name].bundle.js',
    clean: true,
    assetModuleFilename: 'assets/[name][ext]',
  },
  optimization: {
    splitChunks: {
      chunks: 'async',
    },
  },

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
    // Garante que o index.html use o bundle principal
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html',
      chunks: ['main'], 
    }),
    // 💡 MUDANÇA: Garante que o login.html use o MESMO bundle principal
    new HtmlWebpackPlugin({
      template: './login.html',
      filename: 'login.html',
      chunks: ['main'],
    }),
    // 💡 MUDANÇA: Garante que o register.html use o MESMO bundle principal
    new HtmlWebpackPlugin({
      template: './register.html',
      filename: 'register.html',
      chunks: ['main'],
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'assets', to: 'assets', noErrorOnMissing: true },
        { from: 'auth.css', to: 'auth.css', noErrorOnMissing: true },
      ],
    }),
  ],
};