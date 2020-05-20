const merge = require('webpack-merge');
const base = require('./wp.base.config');
module.exports = merge(base, {
  mode: 'production',
});
