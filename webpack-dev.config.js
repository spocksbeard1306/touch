var path = require('path');
var webpack = require('webpack');

var entries = [
  'webpack-dev-server/client?http://localhost:3000',
  'webpack/hot/only-dev-server',
];

module.exports = {
  devtool: 'eval',
  entry: {
    bundle: entries.concat('./src/index.js'),
    login: entries.concat('./src/login.js'),
    forgotReset: entries.concat('./src/forgotReset.js'),
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].min.js',
    publicPath: '/static/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['react-hot', 'babel'],
      include: path.join(__dirname, 'src')
    }]
  }
};
