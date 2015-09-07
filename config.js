'use strict';

/** * Environment variables and application configuration. */
var path = require('path'),
	_ = require('lodash');

var baseConfig = {
	app: {
		root: path.normalize(__dirname + '/../..'),
		env: process.env.NODE_ENV || 'dev'
	}
};

// environment specific config overrides
var platformConfig = {
	log: {
		level: 'debug',
		path: __dirname + '/logs/demo.log'
	},
	app: {
		port: 9595,
		pass: 'Gemini@123',
		models_path: __dirname + '/models'
	},
	mongo: {
		seed: true,
		url: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://127.0.0.1:27017/nodejs-demo'
	}
};

// override the base configuration with the platform specific values
module.exports = _.merge(baseConfig, platformConfig);
