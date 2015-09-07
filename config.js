'use strict';

/** * Environment variables and application configuration. */
var path = require('path'),
	_ = require('lodash');

var baseConfig = {
	app: {
		root: path.normalize(__dirname + '/../..'),
		env: process.env.NODE_ENV,
	}
};

// environment specific config overrides
var platformConfig = {
	development: {
		log: {
			level : 'debug',
			path: __dirname + '/logs/demo.log'
		},
		app: {
			port: 9595
		},
		mongo: {
			seed : false,
			url: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://127.0.0.1:27017/gem-demo'
		}
	},

	test: {
		app: {
			port: 3001
		},
		mongo: {
			url: 'mongodb://127.0.0.1:27017/gem-demo'
		}
	},

	production: {
		app: {
			port: process.env.PORT || 3000,
			cacheTime: 7 * 24 * 60 * 60 * 1000 /* default caching time (7 days) for static files, calculated in milliseconds */
		},
		mongo: {
			url: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://127.0.0.1:27017/gem-demo'
		}
	}
};

// override the base configuration with the platform specific values
module.exports = _.merge(baseConfig, platformConfig[baseConfig.app.env || (baseConfig.app.env = 'development')]);
