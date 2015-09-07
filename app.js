'use strict';

var config = require('./config' );
var logger = require( './logger' );
logger.init( config );

var l = logger.root.child( {'module': __filename.substring(__dirname.length+1, __filename.length-3)} );
process.on( 'uncaughtException', ( err ) => {
	l.error( err, "uncaught Exception" ); });

process.on( 'uncaughtRejection', ( err ) => {
	l.error( err, "uncaught Rejection" ); });

var mongoose = require('mongoose'),
	co = require('co'),
	fs = require('fs'),
	util = require('util'),
	koa = require('koa');

var p = initDB(config);

/** * create server, configure the router middleware */
p.then(function () {
	l.info("Initiating KOA");
	var app = module.exports = koa();

	app.init = co.wrap(function *() {
		l.info("Initiating web server with configuration: %j", config);
		app.server = app.listen(config.app.port);
	});

	/** * auto init if this app is not being initialized by another module (i.e. using require('./app').init();) */
	if (!module.parent) {
		return app.init();
	}

}).catch(function (error) {
	l.error( "Server error : ", error);
});

function initDB(config) {
	l.info('Initiating connection with Mongo DB');
	mongoose.connect(config.mongo.url);
	mongoose.connection.on('disconnected', function (err) {
		l.error(err, 'mongoose db disconnected %j');
	});

	/** * To display the MongoDB query execution plan */
	mongoose.set('debug', true);

	l.info('Seed value: ', config.mongo.seed);
	if (config.mongo.seed) {
		var seedModel = function * (modelName) {
			l.info("Seeding %s", modelName);
			var Model = mongoose.model(modelName);
			l.info('Model info: %j', Model);
			yield Model.find({}).remove().exec();
			var saveDoc = function * (data) {
				var mi = new Model(data);
				yield mi.save();
			};

			for (var data in Model.seedData) {
				yield saveDoc(Model.seedData[data]);
			}
		};

		p = co(function *() {
			l.info('Loading model files from dir: %s', config.app.models_path);

			fs.readdirSync(config.app.models_path).forEach(function (file) {
				l.info('Model File: ', config.app.models_path + '/' + file);
				if (~file.indexOf('js')) {
					require(config.app.models_path + '/' + file);
				}
			});

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
