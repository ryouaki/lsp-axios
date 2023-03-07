const path = require('path');
const htmpPlugin = require('html-webpack-plugin');
const package = require('./package.json');

module.exports = (env) => {
  const config = {
    entry: {
      "lsp-axios": './index.js'
    },
    mode: 'production',
    output: {
      path: path.join(__dirname, 'dist'),
      filename: `lsp-axios.umd.${package.version}.js`,
      libraryTarget: 'umd',
      library: 'lsp-axios'
    },
    target: ['web', 'es5'],
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          options: {
            plugins: process.env.NODE_ENV === 'dev' ? [] : [
              'transform-remove-console'
            ]
          },
          exclude: /node_modules/
        }
      ]
    }
  }

  const plugins = [];

  if (process.env.NODE_ENV === 'dev') {
    plugins.push(new htmpPlugin({
      template: 'public/index.html'
    }))
    config.devServer = {
      historyApiFallback: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8089',
          changeOrigin: true,
          pathRewrite: {
            '^/api': '/api'
          }
        }
      }
    }
  }

  config.plugins = plugins;
  return config;
}

if (process.env.NODE_ENV === 'dev') {
  const Koa = require('koa');
  const cors = require('@koa/cors');

  const app = new Koa();
  app.use(cors());

  app.use(async (ctx, next) => {
    ctx.body = {
      message: "hello world"
    }
  })

  app.listen(8888)
}
