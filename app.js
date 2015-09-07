'use strict';

var config = require('./config' );
var logger = require( './logger' );
logger.init( config );
var l = logger.root.child( {'module': __filename.substring(__dirname.length+1, __filename.length-3)} );

var mongoose = require('mongoose');
var co = require('co'),
	fs = require('fs');

process.on( 'uncaughtException', ( err ) => {
	l.error( err, "uncaught Exception" ); });

process.on( 'uncaughtRejection', ( err ) => {
	l.error( err, "uncaught Rejection" ); });

var p = initDB(config);

var fs = require('fs'),
	util = require('util'),
	_ = require('lodash'),
	koa = require('koa'),
	koaConfig = require('./server/config/koa');

/** * create server, configure the router middleware */
p.then(function () {
	l.info("server starting", logmeta);

	var app = module.exports = koa();

	app.init = co.wrap(function *() {
		l.info("initiating app", logmeta);

		/** * Configure koa for authentication */
		koaConfig(app, passport);

		/** * create http and websocket servers here and start listening for requests */
		app.server = app.listen(config.app.port);

		l.info('Environment: ' + config.app.env, logmeta);
		if (config.app.env !== 'test') {
			l.info('socialdoor-server listening on port ' + config.app.port, logmeta);
		}
	});

	/** * auto init if this app is not being initialized by another module (i.e. using require('./app').init();) */
	if (!module.parent) {
		return app.init();
	}
}).catch(function (onerr) {
	l.error( onerr, "app err", logmeta);
});

function initDB(config) {
	mongoose.connect(config.mongo.url);
	mongoose.connection.on('disconnected', function (err) {
		l.error(err, 'mongoose db disconnected %j', logmeta);
	});

	/** * To display the MongoDB query execution plan */
	mongoose.set('debug', false);

	if (config.mongo.seed) {
		var seedModel = function * (modelName) {
			l.info("seeding %s", modelName, logmeta);
			var Model = mongoose.model(modelName);
			yield Model.remove({}).exec();
			var saveDoc = function * (data) {
				var mi = new Model(data);
				yield mi.save();
			};

			for (var data in Model.seedData) {
				yield saveDoc(Model.seedData[data]);
			}
		};

		p = co(function *() {
			for (var m in mongoose.models) {
				yield seedModel(m);
			}
		});
	} else {
		p = co(function *() {
			Promise.resolve(true);
		});
	}
	return p;
}
