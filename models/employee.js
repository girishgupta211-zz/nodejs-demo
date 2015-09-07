var genSalt = require('../utils/bcrypt_thunk').genSalt(), // version that supports yields
	hash = require('../utils/bcrypt_thunk').hash(),
	compare = require('../utils/bcrypt_thunk').compare(),
	l = require( '../logger' ).root.child( { 'module' : __filename.substring( __dirname.length+1, __filename.length-3 ) }),
	config = require('../config/config'),
	mongoose = require('mongoose'),
	co = require('co'),
	util = require('util'),
	Schema = mongoose.Schema;

var logmeta = {};

var EmployeeSchema = new Schema({
		password: {type: String, required: true},
		name: {
			first: {type: String, required: true},
			last: {type: String, required: true}
		},
		gender: {type: Number},
		dob: {type: Number},
		biography: {
			salary: {type: Number},
			designation: {type: Number, enum: ['Fresher', 'Assistant Engineer', 'Senior Software Eng', 'Manager', 'Senior Mgr']}
		},
		contactInfo: {
			house: {type: String},
			email: {type: String, required: true, unique: true},
			phone: {type: Number, required: true, unique: true},
			address: {type: String},
			city: {type: String},
			state: {type: String},
			country: {type: String},
			countryCode: {type: String}
		}
	},
	{
		toJSON: {
			transform: function (doc, ret, options) {

				delete ret.__v;
				delete ret.password;

			}
		}
	});

/** * Middlewares */
EmployeeSchema.pre('save', function (done) {
	// only hash the password if it has been modified (or is new)
	if (!this.isModified('password')) {
		l.info('Password not changed!');
		return done();
	}
	l.info('Pre save middle ware');
	co.wrap(function * () {
			try {
				var salt = yield genSalt();
				l.info('salt: ', salt);
				var hash = yield hash(this.password, salt);
				l.info('hash: ', hash);
				this.password = hash;
				this.email = this.email.toLowerCase();
				Promise.resolve(true);
			}
			catch (err) {
				Promise.reject(err);
			}
		}
	).call(this).then(done, function (err) {
			done(err)
	});
	l.info('Done pre-save');
});

/** * Methods */
EmployeeSchema.methods.comparePassword = function * (candidatePassword) {
	return yield compare(candidatePassword, this.password);
};

/** * Statics */
EmployeeSchema.statics.passwordMatches = function * (email, password) {
	var emp = yield this.findOne({'contactInfo.email': email.toLowerCase()}).exec();
	if (!emp) throw new Error('Employee not found');

	if (yield emp.comparePassword(password)) {
		l.debug("password match", logmeta );
		return emp;
	}

	l.debug("passwords dont match", logmeta );
	throw new Error('Password does not match');
};

// declare seed data
var seedData = [
	{
		password: config.app.pass,
		name: {first: 'Amit', last: 'Handa'},
		contactInfo: {email: 'amit.handa@geminisolutions.in', phone: 0, address: "address"}
	},
	{
		password: config.app.pass,
		name: {first: 'Manav', last: 'Dahra'},
		contactInfo: {email: 'manav.dahra@geminisolutions.in', phone: 1, address: "address"}
	},
	{
		password: config.app.pass,
		name: {first: 'Rakesh', last: 'Gandhi'},
		contactInfo: {email: 'rakesh.gandhi@geminisolutions.in', phone: 2, address: "address"}
	},
	{
		password: config.app.pass,
		name: {first: 'Shubhra', last: 'Upadhyay'},
		contactInfo: {email: 'shubhra.upadhyay@geminisolutions.in', phone: 3, address: "address"}
	},
	{
		password: config.app.pass,
		name: {first: 'Narendra', last: 'Singh'},
		contactInfo: {email: 'narendra.singh@geminisolutions.in', phone: 4, address: "address"}
	}
];

EmployeeSchema.statics.seedData = seedData;

// Model creation
mongoose.model('Employee', EmployeeSchema);
