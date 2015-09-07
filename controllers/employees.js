'use strict';

/** * employees controller */
var bcrypt = require( '../utils/bcrypt_thunk' ),
	parse = require('koa-better-body'),
	util = require('util'),
	mongoose = require('mongoose'),
	l = require( '../logger' ).root.child( {'module': __filename.substring(__dirname.length+1, __filename.length-3)} ),
	config = require('../config/config'),
	Employee = mongoose.model('Employee');

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

		l.info("get emp: %s request from emp: %s", id );

		var emp = yield Employee.findOne({_id: id}).exec();

		if(emp)
			emp = emp.toJSON();
		else
			this.throw('Could not find the employee', 400);

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

	try {
		var empDesc = this.request.body.fields;
		l.info("add emp request: ", empDesc );

		var newEmp = new Employee(empDesc);
		var saveResult = yield newEmp.save();
		if(saveResult)
			saveResult = saveResult.toJSON();
		else
			this.throw('Could not create a new employee', 400);

		this.status = 201;
		this.body = saveResult;

		l.info("created emp ", newEmp );

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
		l.info("update emp request: ", empDesc );

		var updatedEmp = yield Employee.findByIdAndUpdate(
			{_id: id},
			{$set: empDesc},
			{new: true}
		).exec();
		if(updatedEmp)
			updatedEmp = updatedEmp.toJSON();
		else
			this.throw('Could not update the details of employee', 400);

		this.status = 200;
		this.body = updatedEmp;

		l.info("updated emp ", updatedEmp );

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
		var id = this.params.id;
		var result = yield Employee.findByIdAndRemove({_id: id}).exec();
		if(result)
			result = result.toJSON();
		else
			this.throw('Could not delete the employee', 400);

		l.info("delete res: ", result );
		this.status = 200;

		yield next;
	} catch(err) {
		this.status = err.status || 500;
		this.body = err.message;
		this.app.emit('error', err, this);
	}
}
