const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './built/init.js',
  devtool: false,
  output: {
    filename: 'init.js',
    path: path.resolve(__dirname, '.'),
  },
  optimization: {
    usedExports: true,
  },
  resolve: {
    extensions: ['.webpack.js', '.web.js', '.mjs', '.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
      },
    ],
  },
  plugins: [
    new webpack.IgnorePlugin(/\/iconv-loader$/),
    new webpack.SourceMapDevToolPlugin({
      filename: 'init.js.map'
    }),
  ],
  mode: 'development',
  target: 'node',
};
