import path from 'path';
import fs from 'fs';
import webpack from 'webpack'
import StatsPlugin from 'stats-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

const nodeModules = {};
fs.readdirSync(path.join(__dirname, 'node_modules'))
  .filter(x => ['.bin'].indexOf(x) === -1)
  .forEach(mod => nodeModules[mod] = `commonjs ${mod}`);

const extractTextPlugin = new ExtractTextPlugin('[name].css');
extractTextPlugin.options.allChunks = true;

const config = server => ({
  entry: {
    app: path.join(__dirname, 'src', (server ? 'app.js' : 'client.js'))
  },

  output:{
    path: server ? path.join(__dirname, 'build', 'server') : path.join(__dirname, 'build', 'public'),
    filename: '[name].js',
    chunkFilename: '[id].[hash].js',
    publicPath: '/',
    libraryTarget: (server ? 'commonjs2' : 'var')
  },

  externals: (server ? nodeModules : {}),

  //devtool: 'source-map',

  ...(server ? {target: 'node'} : {}),

  resolve: {
    extensions: ['.js', '.jsx']
  },

  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      { test: /\.css$/, loader: extractTextPlugin.extract(['css-loader']) },
      { test: /\.(gif|png|jpg)$/, loader: 'file-loader' }
    ]
  },

  plugins: [
    new StatsPlugin('stats.json', {
      chunkModules: true,
      exclude: [/node_modules/]
    }),
    extractTextPlugin,
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({minimize: true})
  ]
});

module.exports = [config(true), config(false)];
