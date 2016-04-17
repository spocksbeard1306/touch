var webpack = require('webpack');
var path = require('path');
var buildPath = path.resolve(__dirname, 'public/build');
var nodeModulesPath = path.resolve(__dirname, 'node_modules');

var config = {
  entry: {
    bundle: path.join(__dirname, '/src/index.js'),
    login: path.join(__dirname, '/src/login.js'),
    forgotReset: path.join(__dirname, '/src/forgotReset.js'),
  },
  devtool: 'source-map',
  output: {
    path: buildPath,
    filename: '[name].min.js'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"development"'
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new webpack.NoErrorsPlugin(),
  ],
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        loaders: ['babel'],
        exclude: [nodeModulesPath]
      },
    ]
  },
};

module.exports = config;
