'use strict';

/** * employees controller */
var bcrypt = require( '../utils/bcrypt_thunk' ),
	parse = require('koa-better-body'),
	util = require('util'),
	mongodb = require('mongodb'),
	mongoose = require('mongoose'),
	l = require( '../logger' ).root.child( {'module': __filename.substring(__dirname.length+1, __filename.length-3)} ),
	config = require('../config/config'),
	Employee = mongoose.model('Employee');

var logmeta = {};

// register koa routes
exports.init = function (app) {
	app.get('/v1/emp/:id', getEmp);
	app.post('/v1/emp', parse(), addEmp);
	app.put('/v1/emp/:id', parse(), updateEmp);
	app.del('/v1/emp/:id', removeEmp);
};

/** * get Emp <id> */
function *getEmp(next) {
	try {
		var id = this.params.id;

		l.info("get emp: %s request from emp: %s", id, logmeta );

		var emp = yield Employee.findOne({_id: id}).exec();

		this.body = emp;
		this.status = 200;
		yield next;
	} catch(err){
		this.status = err.status || 500;
		this.body = err.message;
		this.app.emit('error', err, this);
	}
}

/** * Updates emp <id>. */
function *addEmp(next) {
	var updatedEmp;

	try {
		var empDesc = this.request.body.fields;
		l.info("add emp request: ", empDesc, logmeta );

		empDesc.modified = new Date();
		var newEmp = yield Employee.findByIdAndUpdate(
			{_id: id},
			{$set: empDesc},
			{new: true}
		).exec();

		this.status = 201;
		this.body = newEmp;

		l.info("updated emp ", newEmp, logmeta );

		yield next;
	} catch (err) {
		this.status = err.status || 500;
		this.body = err.message;
		this.app.emit('error', err, this);
	}
}

/** * Updates emp <id>. */
function *updateEmp(next) {
	try {
		var id = this.params.id;
		var empDesc = this.request.body.fields;
		l.info("update emp request: ", empDesc, logmeta );

		empDesc.modified = new Date();
		var updatedEmp = yield Employee.findByIdAndUpdate(
			{_id: id},
			{$set: empDesc},
			{new: true}
		).select('_id modified').exec();

		this.status = 200;
		this.body = updatedEmp;

		l.info("updated emp ", updatedEmp, logmeta );

		yield next;
	} catch (err) {
		this.status = err.status || 500;
		this.body = err.message;
		this.app.emit('error', err, this);
	}
}

/** * Delete emp <id>. */
function *removeEmp(next) {
	try{
		var emp = this.params.id;
		var results;

		results = yield Employee.findByIdAndRemove({_id: emp._id}).exec();

		l.info("delete res: ", results, logmeta );
		this.status = 204;

		yield next;
	} catch(err) {
		this.status = err.status || 500;
		this.body = err.message;
		this.app.emit('error', err, this);
	}
}
