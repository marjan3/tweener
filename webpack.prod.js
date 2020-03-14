const merge = require('webpack-merge');
const common = require('./webpack.common');
const path = require('path');

module.exports = merge(common, {
  entry: './src/index.ts',
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'tweener.js',
    library: 'tweener',
    libraryTarget: 'commonjs',
    umdNamedDefine: true
  },
  devtool: 'source-map'
});
