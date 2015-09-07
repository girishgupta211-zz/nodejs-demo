'use strict';

var fs = require('fs'),
	l = require( '../logger').root,
	logger = require('koa-logger'),
	responseTime = require("koa-response-time");

var route = require('koa-router');

module.exports = function (app) {
	app.use(logger());

	app.use(responseTime());

	var router = route(app);

	// mount all the routes defined in the api controllers
	fs.readdirSync( __dirname + '/../controllers').forEach(function (file) {
		if (~file.indexOf('js') )
			require( __dirname + '/../controllers/' + file).init(router);
	});

	app.use(router.routes());
};
